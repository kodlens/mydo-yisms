<?php

namespace App\Services\CashIncentives;

use App\Models\ActivityLog;
use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Models\CashIncentiveStatusHistory;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BeneficiarySelectionService
{
    /**
     * Get searchable and filterable pool of eligible youth profiles not yet in this program.
     */
    public function getAvailableYouthPool(CashIncentiveProgram $program, array $filters = []): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 10);
        $search = trim((string) ($filters['search'] ?? ''));
        $brgyCode = $filters['brgy_code'] ?? null;
        $educationalStatus = $filters['educational_status'] ?? null;
        $yearLevel = $filters['year_level'] ?? null;
        $sex = $filters['sex'] ?? null;

        $query = YouthProfile::query()
            ->with(['barangay', 'city', 'province'])
            ->where('is_active', true)
            ->whereDoesntHave('cashIncentiveBeneficiaries', function ($q) use ($program) {
                $q->where('program_id', $program->id);
            });

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('lname', 'like', "%{$search}%")
                    ->orWhere('fname', 'like', "%{$search}%")
                    ->orWhere('reference_code', 'like', "%{$search}%")
                    ->orWhere('student_id', 'like', "%{$search}%")
                    ->orWhere('school_name', 'like', "%{$search}%")
                    ->orWhere('program', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($brgyCode)) {
            $query->where('brgyCode', $brgyCode);
        }

        if (!empty($sex)) {
            $query->where('sex', $sex);
        }

        if (!empty($yearLevel)) {
            $query->where('year', (int) $yearLevel);
        }

        if (!empty($educationalStatus)) {
            switch ($educationalStatus) {
                case 'enrolled':
                    $query->where('is_graduated', false)
                        ->whereNotNull('school_name')
                        ->where('school_name', '!=', '');
                    break;
                case 'graduated':
                    $query->where('is_graduated', true);
                    break;
                case 'out_of_school':
                    $query->where('is_graduated', false)
                        ->where(function ($q) {
                            $q->whereNull('school_name')->orWhere('school_name', '');
                        });
                    break;
            }
        }

        return $query->orderBy('lname')->orderBy('fname')->paginate($perPage);
    }

    /**
     * Select a youth profile into the program as a potential beneficiary.
     */
    public function selectBeneficiary(
        CashIncentiveProgram $program,
        int $youthProfileId,
        User $actor,
        ?string $remarks = null
    ): CashIncentiveBeneficiary {
        return DB::transaction(function () use ($program, $youthProfileId, $actor, $remarks) {
            $lockedProgram = CashIncentiveProgram::where('id', $program->id)->lockForUpdate()->firstOrFail();

            if ($lockedProgram->status === 'cancelled' || $lockedProgram->status === 'completed') {
                throw ValidationException::withMessages([
                    'program' => "Cannot select beneficiaries for a {$lockedProgram->status} program.",
                ]);
            }

            // Check if already selected in this program
            $alreadySelected = CashIncentiveBeneficiary::where('program_id', $lockedProgram->id)
                ->where('youth_profile_id', $youthProfileId)
                ->exists();

            if ($alreadySelected) {
                throw ValidationException::withMessages([
                    'youth_profile_id' => 'This youth member has already been selected for this program.',
                ]);
            }

            // Check max beneficiary limit
            $currentBeneficiariesCount = CashIncentiveBeneficiary::where('program_id', $lockedProgram->id)->count();
            if ($currentBeneficiariesCount >= $lockedProgram->max_beneficiaries) {
                throw ValidationException::withMessages([
                    'youth_profile_id' => "Program beneficiary limit of {$lockedProgram->max_beneficiaries} has already been reached.",
                ]);
            }

            $youth = YouthProfile::with('barangay')->findOrFail($youthProfileId);

            // Compute historical educational status snapshot
            $historicalEduStatus = $this->resolveEducationalStatus($youth);

            $beneficiary = CashIncentiveBeneficiary::create([
                'program_id' => $lockedProgram->id,
                'youth_profile_id' => $youth->id,
                'status' => 'pending',
                'selected_by_user_id' => $actor->id,
                'selected_at' => now(),
                'remarks' => $remarks,
                'historical_brgy_code' => $youth->brgyCode,
                'historical_brgy_name' => $youth->barangay?->brgyDesc ?? 'N/A',
                'historical_school_name' => $youth->school_name,
                'historical_program' => $youth->program,
                'historical_year_level' => $youth->year,
                'historical_is_graduated' => (bool) $youth->is_graduated,
                'historical_educational_status' => $historicalEduStatus,
            ]);

            $actorName = trim(implode(' ', array_filter([$actor->fname, $actor->mname, $actor->lname, $actor->suffix])));
            $youthName = trim(implode(' ', array_filter([$youth->fname, $youth->mname, $youth->lname, $youth->suffix])));

            CashIncentiveStatusHistory::create([
                'program_id' => $lockedProgram->id,
                'beneficiary_id' => $beneficiary->id,
                'from_status' => null,
                'to_status' => 'pending',
                'action_type' => 'selected',
                'reason' => 'Manually selected for incentive program review',
                'metadata' => [
                    'youth_name' => $youthName,
                    'reference_code' => $youth->reference_code,
                    'barangay' => $beneficiary->historical_brgy_name,
                    'educational_status' => $historicalEduStatus,
                ],
                'actor_user_id' => $actor->id,
                'actor_name' => $actorName,
                'ip_address' => request()->ip(),
            ]);

            return $beneficiary;
        });
    }

    /**
     * Remove a pending or rejected beneficiary from the program.
     */
    public function removeBeneficiary(CashIncentiveBeneficiary $beneficiary, User $actor, string $reason): void
    {
        DB::transaction(function () use ($beneficiary, $actor, $reason) {
            $beneficiary->load(['youthProfile', 'release']);

            if ($beneficiary->release && $beneficiary->release->status === 'released') {
                throw ValidationException::withMessages([
                    'beneficiary' => 'Cannot remove a beneficiary who has already received their cash disbursement.',
                ]);
            }

            $actorName = trim(implode(' ', array_filter([$actor->fname, $actor->mname, $actor->lname, $actor->suffix])));
            $youthName = trim(implode(' ', array_filter([
                $beneficiary->youthProfile?->fname,
                $beneficiary->youthProfile?->mname,
                $beneficiary->youthProfile?->lname,
                $beneficiary->youthProfile?->suffix,
            ])));

            ActivityLog::create([
                'user_id' => $actor->id,
                'actor_name' => $actorName,
                'actor_role' => $actor->role ?? 'staff',
                'action' => 'cash_incentive.beneficiary_removed',
                'description' => "Removed beneficiary {$youthName} from Program #{$beneficiary->program_id}: {$reason}",
                'subject_type' => CashIncentiveBeneficiary::class,
                'subject_id' => $beneficiary->id,
                'old_values' => $beneficiary->toArray(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $beneficiary->delete();
        });
    }

    /**
     * Standardize educational status string.
     */
    public function resolveEducationalStatus(YouthProfile $youth): string
    {
        if ($youth->is_graduated) {
            return 'Graduated';
        }

        if (!empty($youth->year)) {
            $suffix = match ((int) $youth->year) {
                1 => '1st Year',
                2 => '2nd Year',
                3 => '3rd Year',
                4 => '4th Year',
                5 => '5th Year',
                default => "{$youth->year}th Year",
            };
            return "College ({$suffix})";
        }

        if (!empty($youth->school_name)) {
            return 'In-School Youth';
        }

        return 'Out-of-School Youth';
    }
}
