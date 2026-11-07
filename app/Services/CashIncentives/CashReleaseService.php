<?php

namespace App\Services\CashIncentives;

use App\Models\ActivityLog;
use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Models\CashIncentiveRelease;
use App\Models\CashIncentiveStatusHistory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CashReleaseService
{
    /**
     * Record the actual financial disbursement of a cash incentive.
     */
    public function recordCashRelease(
        CashIncentiveBeneficiary $beneficiary,
        array $data,
        User $actor,
        ?UploadedFile $documentFile = null
    ): CashIncentiveRelease {
        return DB::transaction(function () use ($beneficiary, $data, $actor, $documentFile) {
            $beneficiary = CashIncentiveBeneficiary::where('id', $beneficiary->id)
                ->with(['program', 'youthProfile', 'release'])
                ->lockForUpdate()
                ->firstOrFail();

            $program = $beneficiary->program;

            // 1. Verify eligibility: only approved beneficiaries may receive cash release
            if ($beneficiary->status !== 'approved') {
                throw ValidationException::withMessages([
                    'beneficiary' => "Cannot disburse cash incentive to a beneficiary whose status is '{$beneficiary->status}'. Beneficiary must be approved first.",
                ]);
            }

            // 2. Prevent duplicate release
            $existingRelease = $beneficiary->release;
            if ($existingRelease && $existingRelease->status === 'released') {
                throw ValidationException::withMessages([
                    'release' => "A successful cash disbursement has already been recorded for this beneficiary on " .
                        $existingRelease->actual_release_date?->format('M d, Y h:i A') . " (Ref: {$existingRelease->acknowledgment_reference}).",
                ]);
            }

            // 3. Backend-forced fixed amount validation
            $expectedAmount = (float) $program->amount_per_beneficiary;
            if (isset($data['amount']) && abs((float) $data['amount'] - $expectedAmount) > 0.001) {
                throw ValidationException::withMessages([
                    'amount' => "Release amount must strictly match the program fixed amount of ₱" . number_format($expectedAmount, 2) . ".",
                ]);
            }

            // 4. Handle supporting document upload if provided
            $documentPath = null;
            if ($documentFile instanceof UploadedFile) {
                $documentPath = $documentFile->store('cash-incentives/receipts', 'public');
            }

            $releaseDate = !empty($data['actual_release_date'])
                ? \Carbon\Carbon::parse($data['actual_release_date'])
                : now();

            $ackRef = trim($data['acknowledgment_reference']);

            // 5. Update or create the release record
            $release = CashIncentiveRelease::updateOrCreate(
                [
                    'program_id' => $program->id,
                    'beneficiary_id' => $beneficiary->id,
                ],
                [
                    'amount' => $expectedAmount,
                    'status' => 'released',
                    'actual_release_date' => $releaseDate,
                    'acknowledgment_reference' => $ackRef,
                    'supporting_document_path' => $documentPath ?? ($existingRelease?->supporting_document_path),
                    'released_by_user_id' => $actor->id,
                    'remarks' => $data['remarks'] ?? $existingRelease?->remarks,
                    'cancellation_reason' => null,
                    'cancelled_by_user_id' => null,
                    'cancelled_at' => null,
                ]
            );

            $actorName = trim(implode(' ', array_filter([$actor->fname, $actor->mname, $actor->lname, $actor->suffix])));
            $youthName = trim(implode(' ', array_filter([
                $beneficiary->youthProfile?->fname,
                $beneficiary->youthProfile?->mname,
                $beneficiary->youthProfile?->lname,
                $beneficiary->youthProfile?->suffix,
            ])));

            // 6. Record status history audit
            CashIncentiveStatusHistory::create([
                'program_id' => $program->id,
                'beneficiary_id' => $beneficiary->id,
                'release_id' => $release->id,
                'from_status' => $existingRelease?->status ?? 'pending',
                'to_status' => 'released',
                'action_type' => 'cash_released',
                'reason' => "Cash incentive of ₱" . number_format($expectedAmount, 2) . " released and acknowledged (Ref: {$ackRef})",
                'metadata' => [
                    'amount' => $expectedAmount,
                    'acknowledgment_reference' => $ackRef,
                    'disbursed_to' => $youthName,
                    'reference_code' => $beneficiary->youthProfile?->reference_code,
                    'released_by' => $actorName,
                    'document_path' => $release->supporting_document_path,
                ],
                'actor_user_id' => $actor->id,
                'actor_name' => $actorName,
                'ip_address' => request()->ip(),
            ]);

            // 7. Record financial audit in activity_logs
            ActivityLog::create([
                'user_id' => $actor->id,
                'actor_name' => $actorName,
                'actor_role' => $actor->role ?? 'staff',
                'action' => 'cash_incentive.cash_released',
                'description' => "Disbursed ₱" . number_format($expectedAmount, 2) . " to {$youthName} (Ref: {$ackRef}) for Program '{$program->title}'",
                'subject_type' => CashIncentiveRelease::class,
                'subject_id' => $release->id,
                'old_values' => ['status' => $existingRelease?->status ?? 'pending'],
                'new_values' => [
                    'status' => 'released',
                    'amount' => $expectedAmount,
                    'acknowledgment_reference' => $ackRef,
                    'actual_release_date' => $releaseDate->toDateTimeString(),
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return $release;
        });
    }

    /**
     * Schedule a release date or update release status (e.g. unclaimed, scheduled, cancelled).
     */
    public function updateReleaseStatus(
        CashIncentiveRelease $release,
        string $status,
        User $actor,
        array $params = []
    ): CashIncentiveRelease {
        return DB::transaction(function () use ($release, $status, $actor, $params) {
            $release = CashIncentiveRelease::where('id', $release->id)
                ->with(['program', 'beneficiary', 'beneficiary.youthProfile'])
                ->lockForUpdate()
                ->firstOrFail();

            $fromStatus = $release->status;

            if ($fromStatus === 'released' && $status !== 'cancelled') {
                throw ValidationException::withMessages([
                    'status' => 'A successfully released transaction cannot be altered to another status without explicit administrative cancellation.',
                ]);
            }

            if ($status === 'cancelled' && empty(trim((string) ($params['cancellation_reason'] ?? '')))) {
                throw ValidationException::withMessages([
                    'cancellation_reason' => 'A cancellation reason is required to void or cancel a cash release.',
                ]);
            }

            $updateData = ['status' => $status];

            if ($status === 'scheduled') {
                $updateData['scheduled_release_date'] = $params['scheduled_release_date'] ?? now()->toDateString();
            }

            if ($status === 'cancelled') {
                $updateData['cancellation_reason'] = trim($params['cancellation_reason']);
                $updateData['cancelled_by_user_id'] = $actor->id;
                $updateData['cancelled_at'] = now();
            }

            $release->update($updateData);

            $actorName = trim(implode(' ', array_filter([$actor->fname, $actor->mname, $actor->lname, $actor->suffix])));
            $youthName = trim(implode(' ', array_filter([
                $release->beneficiary?->youthProfile?->fname,
                $release->beneficiary?->youthProfile?->mname,
                $release->beneficiary?->youthProfile?->lname,
            ])));

            CashIncentiveStatusHistory::create([
                'program_id' => $release->program_id,
                'beneficiary_id' => $release->beneficiary_id,
                'release_id' => $release->id,
                'from_status' => $fromStatus,
                'to_status' => $status,
                'action_type' => "release_{$status}",
                'reason' => $params['cancellation_reason'] ?? ($params['remarks'] ?? "Status updated from {$fromStatus} to {$status}"),
                'metadata' => [
                    'actor' => $actorName,
                    'youth_name' => $youthName,
                ],
                'actor_user_id' => $actor->id,
                'actor_name' => $actorName,
                'ip_address' => request()->ip(),
            ]);

            ActivityLog::create([
                'user_id' => $actor->id,
                'actor_name' => $actorName,
                'actor_role' => $actor->role ?? 'staff',
                'action' => "cash_incentive.release_{$status}",
                'description' => "Changed release #{$release->id} status for {$youthName} from {$fromStatus} to {$status}",
                'subject_type' => CashIncentiveRelease::class,
                'subject_id' => $release->id,
                'old_values' => ['status' => $fromStatus],
                'new_values' => ['status' => $status],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return $release;
        });
    }
}
