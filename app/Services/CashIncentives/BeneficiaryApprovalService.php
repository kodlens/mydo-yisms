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

class BeneficiaryApprovalService
{
    /**
     * Review an individual beneficiary (Approve or Reject).
     */
    public function reviewBeneficiary(
        CashIncentiveBeneficiary $beneficiary,
        string $status,
        User $actor,
        ?string $rejectionReason = null,
        ?string $remarks = null
    ): CashIncentiveBeneficiary {
        if (!in_array($status, ['approved', 'rejected'], true)) {
            throw ValidationException::withMessages([
                'status' => 'Status must be either approved or rejected.',
            ]);
        }

        if ($status === 'rejected' && empty(trim((string) $rejectionReason))) {
            throw ValidationException::withMessages([
                'rejection_reason' => 'A clear rejection reason is required when rejecting a beneficiary.',
            ]);
        }

        return DB::transaction(function () use ($beneficiary, $status, $actor, $rejectionReason, $remarks) {
            $beneficiary = CashIncentiveBeneficiary::where('id', $beneficiary->id)
                ->with(['program', 'youthProfile', 'release'])
                ->lockForUpdate()
                ->firstOrFail();

            $program = $beneficiary->program;

            // Check if release is already processed
            if ($beneficiary->release && $beneficiary->release->status === 'released') {
                throw ValidationException::withMessages([
                    'status' => 'Cannot modify review status for a beneficiary whose cash disbursement has already been released.',
                ]);
            }

            $fromStatus = $beneficiary->status;

            if ($status === 'approved') {
                // Ensure approved commitments do not exceed allocated budget
                $approvedCount = CashIncentiveBeneficiary::where('program_id', $program->id)
                    ->where('status', 'approved')
                    ->where('id', '!=', $beneficiary->id)
                    ->count();

                $futureApprovedCount = $approvedCount + 1;
                $futureCommitment = $futureApprovedCount * (float) $program->amount_per_beneficiary;

                if ($futureCommitment > (float) $program->allocated_budget) {
                    throw ValidationException::withMessages([
                        'status' => "Approving this beneficiary would exceed the allocated budget ceiling of ₱" . number_format($program->allocated_budget, 2) . ".",
                    ]);
                }

                $beneficiary->update([
                    'status' => 'approved',
                    'reviewed_by_user_id' => $actor->id,
                    'reviewed_at' => now(),
                    'rejection_reason' => null,
                    'remarks' => $remarks ?: $beneficiary->remarks,
                ]);

                // Ensure a pending cash release record exists with fixed amount
                CashIncentiveRelease::firstOrCreate(
                    [
                        'program_id' => $program->id,
                        'beneficiary_id' => $beneficiary->id,
                    ],
                    [
                        'amount' => $program->amount_per_beneficiary,
                        'status' => 'pending',
                    ]
                );
            } else {
                $beneficiary->update([
                    'status' => 'rejected',
                    'reviewed_by_user_id' => $actor->id,
                    'reviewed_at' => now(),
                    'rejection_reason' => trim((string) $rejectionReason),
                    'remarks' => $remarks ?: $beneficiary->remarks,
                ]);

                // If a pending/scheduled release existed, delete or mark cancelled
                if ($beneficiary->release && in_array($beneficiary->release->status, ['pending', 'scheduled'], true)) {
                    $beneficiary->release()->delete();
                }
            }

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
                'from_status' => $fromStatus,
                'to_status' => $status,
                'action_type' => $status === 'approved' ? 'approved' : 'rejected',
                'reason' => $status === 'rejected' ? $rejectionReason : ($remarks ?: 'Eligibility verified and approved for incentive'),
                'metadata' => [
                    'reviewer' => $actorName,
                    'youth_name' => $youthName,
                    'amount' => $program->amount_per_beneficiary,
                ],
                'actor_user_id' => $actor->id,
                'actor_name' => $actorName,
                'ip_address' => request()->ip(),
            ]);

            ActivityLog::create([
                'user_id' => $actor->id,
                'actor_name' => $actorName,
                'actor_role' => $actor->role ?? 'staff',
                'action' => "cash_incentive.beneficiary_{$status}",
                'description' => "Marked beneficiary {$youthName} as {$status} in program '{$program->title}'",
                'subject_type' => CashIncentiveBeneficiary::class,
                'subject_id' => $beneficiary->id,
                'old_values' => ['status' => $fromStatus],
                'new_values' => ['status' => $status, 'rejection_reason' => $rejectionReason],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return $beneficiary->fresh(['release', 'reviewedBy']);
        });
    }
}
