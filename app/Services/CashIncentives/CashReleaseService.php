<?php

namespace App\Services\CashIncentives;

use App\Models\ActivityLog;
use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Models\CashIncentiveRelease;
use App\Models\CashIncentiveStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CashReleaseService
{
    /**
     * Record actual financial disbursement of a cash incentive to a beneficiary.
     */
    public function recordCashRelease(
        CashIncentiveBeneficiary $beneficiary,
        array $data,
        User $actor
    ): CashIncentiveRelease {
        return DB::transaction(function () use ($beneficiary, $data, $actor) {
            $beneficiary = CashIncentiveBeneficiary::where('id', $beneficiary->id)
                ->with(['program', 'youthProfile', 'release'])
                ->lockForUpdate()
                ->firstOrFail();

            $program = $beneficiary->program;

            // Ensure beneficiary is marked as approved/eligible
            if ($beneficiary->status !== 'approved') {
                $beneficiary->update([
                    'status' => 'approved',
                    'reviewed_by_user_id' => $actor->id,
                    'reviewed_at' => now(),
                ]);
            }

            // Check if already released
            $existingRelease = $beneficiary->release;
            if ($existingRelease && $existingRelease->status === 'released') {
                throw ValidationException::withMessages([
                    'release' => "Cash incentive has already been released to this beneficiary on " .
                        $existingRelease->actual_release_date?->format('M d, Y h:i A') . ".",
                ]);
            }

            $expectedAmount = (float) $program->amount_per_beneficiary;
            $releaseDate = !empty($data['actual_release_date'])
                ? \Carbon\Carbon::parse($data['actual_release_date'])
                : now();

            $ackRef = !empty(trim((string) ($data['acknowledgment_reference'] ?? '')))
                ? trim($data['acknowledgment_reference'])
                : sprintf('PR-%s-%04d', $program->code, $beneficiary->id);

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

            CashIncentiveStatusHistory::create([
                'program_id' => $program->id,
                'beneficiary_id' => $beneficiary->id,
                'release_id' => $release->id,
                'from_status' => $existingRelease?->status ?? 'pending',
                'to_status' => 'released',
                'action_type' => 'cash_released',
                'reason' => "Cash incentive of ₱" . number_format($expectedAmount, 2) . " disbursed (Ref: {$ackRef})",
                'metadata' => [
                    'amount' => $expectedAmount,
                    'acknowledgment_reference' => $ackRef,
                    'disbursed_to' => $youthName,
                    'released_by' => $actorName,
                ],
                'actor_user_id' => $actor->id,
                'actor_name' => $actorName,
                'ip_address' => request()->ip(),
            ]);

            ActivityLog::create([
                'user_id' => $actor->id,
                'actor_name' => $actorName,
                'actor_role' => $actor->role ?? 'staff',
                'action' => 'cash_incentive.cash_released',
                'description' => "Disbursed ₱" . number_format($expectedAmount, 2) . " cash incentive to {$youthName} for Program '{$program->title}'",
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
     * Batch record cash releases for multiple beneficiaries.
     */
    public function batchRecordRelease(
        CashIncentiveProgram $program,
        array $beneficiaryIds,
        User $actor,
        ?string $ackRef = null,
        ?string $remarks = null
    ): int {
        $count = 0;
        foreach ($beneficiaryIds as $bId) {
            $beneficiary = CashIncentiveBeneficiary::where('program_id', $program->id)
                ->where('id', $bId)
                ->first();

            if ($beneficiary) {
                try {
                    $this->recordCashRelease($beneficiary, [
                        'acknowledgment_reference' => $ackRef,
                        'remarks' => $remarks ?: 'Batch disbursement release',
                    ], $actor);
                    $count++;
                } catch (\Exception $e) {
                    // skip already released
                }
            }
        }

        return $count;
    }

    /**
     * Revert / undo a released disbursement back to pending.
     */
    public function revertCashRelease(
        CashIncentiveBeneficiary $beneficiary,
        User $actor,
        ?string $reason = null
    ): CashIncentiveRelease {
        return DB::transaction(function () use ($beneficiary, $actor, $reason) {
            $beneficiary = CashIncentiveBeneficiary::where('id', $beneficiary->id)
                ->with(['program', 'youthProfile', 'release'])
                ->lockForUpdate()
                ->firstOrFail();

            $release = $beneficiary->release;
            if (!$release || $release->status !== 'released') {
                throw ValidationException::withMessages([
                    'release' => 'Only released transactions can be reverted.',
                ]);
            }

            $fromStatus = $release->status;

            $release->update([
                'status' => 'pending',
                'actual_release_date' => null,
                'released_by_user_id' => null,
                'remarks' => $reason ? "Reverted: {$reason}" : $release->remarks,
            ]);

            $actorName = trim(implode(' ', array_filter([$actor->fname, $actor->mname, $actor->lname, $actor->suffix])));
            $youthName = trim(implode(' ', array_filter([
                $beneficiary->youthProfile?->fname,
                $beneficiary->youthProfile?->mname,
                $beneficiary->youthProfile?->lname,
            ])));

            CashIncentiveStatusHistory::create([
                'program_id' => $beneficiary->program_id,
                'beneficiary_id' => $beneficiary->id,
                'release_id' => $release->id,
                'from_status' => $fromStatus,
                'to_status' => 'pending',
                'action_type' => 'release_reverted',
                'reason' => $reason ?: 'Disbursement reverted back to pending by staff',
                'actor_user_id' => $actor->id,
                'actor_name' => $actorName,
                'ip_address' => request()->ip(),
            ]);

            ActivityLog::create([
                'user_id' => $actor->id,
                'actor_name' => $actorName,
                'actor_role' => $actor->role ?? 'staff',
                'action' => 'cash_incentive.release_reverted',
                'description' => "Reverted cash release for {$youthName} back to pending",
                'subject_type' => CashIncentiveRelease::class,
                'subject_id' => $release->id,
                'old_values' => ['status' => 'released'],
                'new_values' => ['status' => 'pending'],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return $release;
        });
    }

    /**
     * Update release status (e.g. unclaimed or cancelled).
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

            $updateData = ['status' => $status];

            if ($status === 'scheduled') {
                $updateData['scheduled_release_date'] = $params['scheduled_release_date'] ?? now()->toDateString();
            }

            if ($status === 'cancelled') {
                $updateData['cancellation_reason'] = trim($params['cancellation_reason'] ?? 'Cancelled by staff');
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
                'actor_user_id' => $actor->id,
                'actor_name' => $actorName,
                'ip_address' => request()->ip(),
            ]);

            return $release;
        });
    }
}
