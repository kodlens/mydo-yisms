<?php

namespace App\Services\CashIncentives;

use App\Models\ActivityLog;
use App\Models\CashIncentiveProgram;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProgramManagementService
{
    /**
     * Create a new cash incentive program.
     */
    public function createProgram(array $data, User $actor): CashIncentiveProgram
    {
        return DB::transaction(function () use ($data, $actor) {
            $year = (int) ($data['funding_year'] ?? now()->year);
            $code = !empty($data['code']) ? trim($data['code']) : $this->generateProgramCode($year);

            $amount = (float) $data['amount_per_beneficiary'];
            $budget = (float) $data['allocated_budget'];
            $maxBeneficiaries = (int) $data['max_beneficiaries'];

            if (($maxBeneficiaries * $amount) > $budget) {
                throw ValidationException::withMessages([
                    'allocated_budget' => 'Allocated budget must be at least equal to maximum beneficiaries multiplied by amount per beneficiary (' . number_format($maxBeneficiaries * $amount, 2) . ').',
                ]);
            }

            $program = CashIncentiveProgram::create([
                'code' => $code,
                'title' => trim($data['title']),
                'description' => $data['description'] ?? null,
                'funding_year' => $year,
                'amount_per_beneficiary' => $amount,
                'allocated_budget' => $budget,
                'max_beneficiaries' => $maxBeneficiaries,
                'selection_start_date' => $data['selection_start_date'] ?? null,
                'selection_end_date' => $data['selection_end_date'] ?? null,
                'release_start_date' => $data['release_start_date'] ?? null,
                'release_end_date' => $data['release_end_date'] ?? null,
                'status' => $data['status'] ?? 'draft',
                'created_by_user_id' => $actor->id,
            ]);

            ActivityLog::create([
                'user_id' => $actor->id,
                'actor_name' => trim(implode(' ', array_filter([$actor->fname, $actor->mname, $actor->lname, $actor->suffix]))),
                'actor_role' => $actor->role ?? 'staff',
                'action' => 'cash_incentive.program_created',
                'description' => "Created Cash Incentive Program '{$program->title}' ({$program->code}) with budget ₱" . number_format($program->allocated_budget, 2),
                'subject_type' => CashIncentiveProgram::class,
                'subject_id' => $program->id,
                'old_values' => null,
                'new_values' => $program->toArray(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return $program;
        });
    }

    /**
     * Update an existing program.
     */
    public function updateProgram(CashIncentiveProgram $program, array $data, User $actor): CashIncentiveProgram
    {
        return DB::transaction(function () use ($program, $data, $actor) {
            $amount = isset($data['amount_per_beneficiary']) ? (float) $data['amount_per_beneficiary'] : (float) $program->amount_per_beneficiary;
            $budget = isset($data['allocated_budget']) ? (float) $data['allocated_budget'] : (float) $program->allocated_budget;
            $maxBeneficiaries = isset($data['max_beneficiaries']) ? (int) $data['max_beneficiaries'] : (int) $program->max_beneficiaries;

            if (($maxBeneficiaries * $amount) > $budget) {
                throw ValidationException::withMessages([
                    'allocated_budget' => 'Allocated budget must be at least equal to maximum beneficiaries multiplied by amount per beneficiary (' . number_format($maxBeneficiaries * $amount, 2) . ').',
                ]);
            }

            // Check if already released amount exceeds new budget
            $totalReleased = (float) $program->releases()->where('status', 'released')->sum('amount');
            if ($budget < $totalReleased) {
                throw ValidationException::withMessages([
                    'allocated_budget' => "Allocated budget cannot be reduced below the total cash already disbursed (₱" . number_format($totalReleased, 2) . ").",
                ]);
            }

            // Check if approved beneficiaries exceed new max beneficiaries
            $approvedCount = $program->beneficiaries()->where('status', 'approved')->count();
            if ($maxBeneficiaries < $approvedCount) {
                throw ValidationException::withMessages([
                    'max_beneficiaries' => "Max beneficiaries cannot be lower than the number of already approved beneficiaries ({$approvedCount}).",
                ]);
            }

            $old = $program->toArray();

            $program->update([
                'title' => trim($data['title'] ?? $program->title),
                'description' => array_key_exists('description', $data) ? $data['description'] : $program->description,
                'funding_year' => $data['funding_year'] ?? $program->funding_year,
                'amount_per_beneficiary' => $amount,
                'allocated_budget' => $budget,
                'max_beneficiaries' => $maxBeneficiaries,
                'selection_start_date' => $data['selection_start_date'] ?? $program->selection_start_date,
                'selection_end_date' => $data['selection_end_date'] ?? $program->selection_end_date,
                'release_start_date' => $data['release_start_date'] ?? $program->release_start_date,
                'release_end_date' => $data['release_end_date'] ?? $program->release_end_date,
                'status' => $data['status'] ?? $program->status,
            ]);

            ActivityLog::create([
                'user_id' => $actor->id,
                'actor_name' => trim(implode(' ', array_filter([$actor->fname, $actor->mname, $actor->lname, $actor->suffix]))),
                'actor_role' => $actor->role ?? 'staff',
                'action' => 'cash_incentive.program_updated',
                'description' => "Updated Cash Incentive Program '{$program->title}' ({$program->code})",
                'subject_type' => CashIncentiveProgram::class,
                'subject_id' => $program->id,
                'old_values' => $old,
                'new_values' => $program->toArray(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return $program;
        });
    }

    /**
     * Compute comprehensive budget & progress summary.
     */
    public function getProgramSummary(CashIncentiveProgram $program): array
    {
        $allocatedBudget = (float) $program->allocated_budget;
        $amountPerBeneficiary = (float) $program->amount_per_beneficiary;
        $maxBeneficiaries = (int) $program->max_beneficiaries;

        $beneficiaries = $program->beneficiaries()->select('id', 'status')->get();
        $totalSelected = $beneficiaries->count();
        $pendingReviewCount = $beneficiaries->where('status', 'pending')->count();
        $approvedCount = $beneficiaries->where('status', 'approved')->count();
        $rejectedCount = $beneficiaries->where('status', 'rejected')->count();

        $releases = $program->releases()->select('id', 'status', 'amount')->get();
        $releasedCount = $releases->where('status', 'released')->count();
        $releasedAmount = (float) $releases->where('status', 'released')->sum('amount');
        $pendingReleaseCount = $releases->where('status', 'pending')->count();
        $scheduledReleaseCount = $releases->where('status', 'scheduled')->count();
        $unclaimedReleaseCount = $releases->where('status', 'unclaimed')->count();
        $cancelledReleaseCount = $releases->where('status', 'cancelled')->count();

        $committedAmount = $approvedCount * $amountPerBeneficiary;
        $remainingBudget = max(0, $allocatedBudget - $releasedAmount);
        $budgetUtilizationRate = $allocatedBudget > 0 ? round(($releasedAmount / $allocatedBudget) * 100, 1) : 0;
        $releaseRate = $approvedCount > 0 ? round(($releasedCount / $approvedCount) * 100, 1) : 0;

        return [
            'allocated_budget' => $allocatedBudget,
            'amount_per_beneficiary' => $amountPerBeneficiary,
            'max_beneficiaries' => $maxBeneficiaries,
            'total_selected_count' => $totalSelected,
            'pending_review_count' => $pendingReviewCount,
            'approved_count' => $approvedCount,
            'rejected_count' => $rejectedCount,
            'committed_amount' => $committedAmount,
            'released_count' => $releasedCount,
            'released_amount' => $releasedAmount,
            'remaining_budget' => $remainingBudget,
            'pending_release_count' => $pendingReleaseCount,
            'scheduled_release_count' => $scheduledReleaseCount,
            'unclaimed_release_count' => $unclaimedReleaseCount,
            'cancelled_release_count' => $cancelledReleaseCount,
            'budget_utilization_rate' => $budgetUtilizationRate,
            'release_rate' => $releaseRate,
        ];
    }

    /**
     * Auto-generate program code (e.g. CIP-2026-001).
     */
    public function generateProgramCode(int $year): string
    {
        $count = CashIncentiveProgram::where('funding_year', $year)->count() + 1;
        do {
            $code = sprintf('CIP-%d-%03d', $year, $count);
            $exists = CashIncentiveProgram::where('code', $code)->exists();
            $count++;
        } while ($exists);

        return $code;
    }
}
