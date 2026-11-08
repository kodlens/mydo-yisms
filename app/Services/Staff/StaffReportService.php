<?php

namespace App\Services\Staff;

use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Models\CashIncentiveRelease;
use App\Models\YouthProfile;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StaffReportService
{
    /**
     * Compile complete report datasets based on requested filters.
     *
     * @param array{
     *   program_id?: int|string|null,
     *   year?: int|string|null
     * } $filters
     * @return array<string, mixed>
     */
    public function getReportsData(array $filters = []): array
    {
        $programId = !empty($filters['program_id']) && $filters['program_id'] !== 'all'
            ? (int) $filters['program_id']
            : null;

        $selectedYear = !empty($filters['year']) && $filters['year'] !== 'all'
            ? (int) $filters['year']
            : null;

        // 1. Available filter options
        $allPrograms = CashIncentiveProgram::query()
            ->select('id', 'code', 'title', 'funding_year', 'allocated_budget', 'amount_per_beneficiary')
            ->orderBy('funding_year', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $availableYears = CashIncentiveProgram::query()
            ->distinct()
            ->orderBy('funding_year', 'desc')
            ->pluck('funding_year')
            ->filter()
            ->values()
            ->all();

        if (empty($availableYears)) {
            $availableYears = [(int) date('Y')];
        }

        // 2. Base queries for Programs, Beneficiaries, and Releases
        $programsQuery = CashIncentiveProgram::query();
        if ($programId) {
            $programsQuery->where('id', $programId);
        }
        if ($selectedYear) {
            $programsQuery->where('funding_year', $selectedYear);
        }
        $filteredPrograms = $programsQuery->get();
        $filteredProgramIds = $filteredPrograms->pluck('id')->all();

        $beneficiariesQuery = CashIncentiveBeneficiary::query()
            ->with(['release', 'youthProfile'])
            ->whereIn('program_id', $filteredProgramIds);

        $beneficiaries = $beneficiariesQuery->get();

        $releasesQuery = CashIncentiveRelease::query()
            ->with(['program', 'beneficiary.youthProfile'])
            ->whereIn('program_id', $filteredProgramIds);

        $allReleases = $releasesQuery->get();
        $releasedReleases = $allReleases->where('status', 'released');
        $pendingReleases = $allReleases->where('status', 'pending');

        // 3. KPI Summary
        $totalBudget = (float) $filteredPrograms->sum('allocated_budget');
        $totalDisbursed = (float) $releasedReleases->sum('amount');
        $totalPendingAmount = (float) $pendingReleases->sum('amount');
        $remainingBudget = max(0, $totalBudget - $totalDisbursed);
        $utilizationRate = $totalBudget > 0 ? round(($totalDisbursed / $totalBudget) * 100, 1) : 0;

        // Student counts
        $totalStudentsGiven = $releasedReleases->pluck('beneficiary.youth_profile_id')->filter()->unique()->count();
        $totalStudentsEnrolled = $beneficiaries->pluck('youth_profile_id')->filter()->unique()->count();
        $totalRegisteredYouth = YouthProfile::query()->count();

        // Barangay counts
        $barangaysGiven = $releasedReleases->map(function ($r) {
            return $r->beneficiary?->historical_brgy_name ?: 'Unspecified';
        })->filter()->unique()->values();

        $barangaysEnrolled = $beneficiaries->map(function ($b) {
            return $b->historical_brgy_name ?: 'Unspecified';
        })->filter()->unique()->values();

        $kpis = [
            'total_budget' => $totalBudget,
            'total_disbursed' => $totalDisbursed,
            'total_pending_amount' => $totalPendingAmount,
            'remaining_budget' => $remainingBudget,
            'utilization_rate' => $utilizationRate,
            'total_students_given' => $totalStudentsGiven,
            'total_students_enrolled' => $totalStudentsEnrolled,
            'total_registered_youth' => $totalRegisteredYouth,
            'total_barangays_given' => $barangaysGiven->count(),
            'total_barangays_enrolled' => $barangaysEnrolled->count(),
        ];

        // 4. Financial Reports (Weekly, Monthly, Yearly)
        $financialWeekly = $this->compileWeeklyFinancial($releasedReleases);
        $financialMonthly = $this->compileMonthlyFinancial($releasedReleases);
        $financialYearly = $this->compileYearlyFinancial($filteredPrograms, $releasedReleases);

        // 5. Barangay Breakdown
        $barangayBreakdown = $this->compileBarangayBreakdown($beneficiaries, $totalDisbursed);

        // 6. Students Demographic Breakdown
        $studentBreakdown = $this->compileStudentBreakdown($beneficiaries);

        return [
            'filters' => [
                'program_id' => $programId ? (string) $programId : 'all',
                'year' => $selectedYear ? (string) $selectedYear : 'all',
            ],
            'options' => [
                'programs' => $allPrograms->map(fn ($p) => [
                    'id' => (string) $p->id,
                    'code' => $p->code,
                    'title' => $p->title,
                    'funding_year' => $p->funding_year,
                    'allocated_budget' => (float) $p->allocated_budget,
                ]),
                'years' => $availableYears,
            ],
            'kpis' => $kpis,
            'financial' => [
                'weekly' => $financialWeekly,
                'monthly' => $financialMonthly,
                'yearly' => $financialYearly,
            ],
            'barangays' => $barangayBreakdown,
            'students' => $studentBreakdown,
        ];
    }

    /**
     * Group releases by week.
     *
     * @param Collection<int, CashIncentiveRelease> $releases
     * @return array<int, array<string, mixed>>
     */
    protected function compileWeeklyFinancial(Collection $releases): array
    {
        $grouped = $releases->groupBy(function (CashIncentiveRelease $release) {
            $date = $release->actual_release_date ?? $release->created_at;
            $carbon = Carbon::parse($date);
            return $carbon->format('o-\WW'); // ISO-8601 year and week number
        });

        $results = [];
        foreach ($grouped as $weekKey => $items) {
            $first = $items->first();
            $date = Carbon::parse($first->actual_release_date ?? $first->created_at);
            $startOfWeek = $date->copy()->startOfWeek();
            $endOfWeek = $date->copy()->endOfWeek();

            $totalAmount = (float) $items->sum('amount');
            $studentCount = $items->pluck('beneficiary.youth_profile_id')->unique()->count();
            $programsCount = $items->pluck('program_id')->unique()->count();

            $results[] = [
                'week_key' => $weekKey,
                'week_number' => (int) $date->isoWeek(),
                'year' => (int) $date->isoWeekYear(),
                'period_label' => sprintf('%s - %s', $startOfWeek->format('M d, Y'), $endOfWeek->format('M d, Y')),
                'disbursed_amount' => $totalAmount,
                'students_count' => $studentCount,
                'releases_count' => $items->count(),
                'programs_count' => $programsCount,
                'average_per_student' => $studentCount > 0 ? round($totalAmount / $studentCount, 2) : 0,
            ];
        }

        // Sort descending by week key
        usort($results, fn ($a, $b) => strcmp($b['week_key'], $a['week_key']));

        return $results;
    }

    /**
     * Group releases by month.
     *
     * @param Collection<int, CashIncentiveRelease> $releases
     * @return array<int, array<string, mixed>>
     */
    protected function compileMonthlyFinancial(Collection $releases): array
    {
        $grouped = $releases->groupBy(function (CashIncentiveRelease $release) {
            $date = $release->actual_release_date ?? $release->created_at;
            return Carbon::parse($date)->format('Y-m');
        });

        $results = [];
        foreach ($grouped as $monthKey => $items) {
            $date = Carbon::parse($monthKey . '-01');
            $totalAmount = (float) $items->sum('amount');
            $studentCount = $items->pluck('beneficiary.youth_profile_id')->unique()->count();

            $results[] = [
                'month_key' => $monthKey,
                'month_name' => $date->format('F Y'),
                'year' => (int) $date->format('Y'),
                'month_number' => (int) $date->format('n'),
                'disbursed_amount' => $totalAmount,
                'students_count' => $studentCount,
                'releases_count' => $items->count(),
                'average_per_student' => $studentCount > 0 ? round($totalAmount / $studentCount, 2) : 0,
            ];
        }

        usort($results, fn ($a, $b) => strcmp($b['month_key'], $a['month_key']));

        return $results;
    }

    /**
     * Group budget and disbursements by year.
     *
     * @param Collection<int, CashIncentiveProgram> $programs
     * @param Collection<int, CashIncentiveRelease> $releases
     * @return array<int, array<string, mixed>>
     */
    protected function compileYearlyFinancial(Collection $programs, Collection $releases): array
    {
        $years = $programs->pluck('funding_year')->merge(
            $releases->map(fn ($r) => (int) Carbon::parse($r->actual_release_date ?? $r->created_at)->format('Y'))
        )->unique()->sortDesc()->values();

        $results = [];
        foreach ($years as $year) {
            $yearPrograms = $programs->where('funding_year', $year);
            $yearBudget = (float) $yearPrograms->sum('allocated_budget');

            $yearReleases = $releases->filter(function ($r) use ($year) {
                return (int) Carbon::parse($r->actual_release_date ?? $r->created_at)->format('Y') === (int) $year;
            });

            $disbursed = (float) $yearReleases->sum('amount');
            $studentsCount = $yearReleases->pluck('beneficiary.youth_profile_id')->unique()->count();
            $remaining = max(0, $yearBudget - $disbursed);
            $utilization = $yearBudget > 0 ? round(($disbursed / $yearBudget) * 100, 1) : 0;

            $results[] = [
                'year' => $year,
                'allocated_budget' => $yearBudget,
                'disbursed_amount' => $disbursed,
                'remaining_budget' => $remaining,
                'students_count' => $studentsCount,
                'releases_count' => $yearReleases->count(),
                'programs_count' => $yearPrograms->count(),
                'utilization_rate' => $utilization,
            ];
        }

        return $results;
    }

    /**
     * Compile Barangay breakdown with student counts and disbursements.
     *
     * @param Collection<int, CashIncentiveBeneficiary> $beneficiaries
     * @param float $totalMunicipalDisbursed
     * @return array<string, mixed>
     */
    protected function compileBarangayBreakdown(Collection $beneficiaries, float $totalMunicipalDisbursed): array
    {
        $grouped = $beneficiaries->groupBy(function (CashIncentiveBeneficiary $b) {
            return $b->historical_brgy_name ?: 'Unspecified';
        });

        $list = [];
        foreach ($grouped as $brgyName => $items) {
            $enrolled = $items->count();
            $approved = $items->where('status', 'approved')->count();
            $rejected = $items->where('status', 'rejected')->count();
            $pending = $items->where('status', 'pending')->count();

            $releasedItems = $items->filter(fn ($b) => $b->release?->status === 'released');
            $givenStudents = $releasedItems->count();
            $disbursedAmount = (float) $releasedItems->sum(fn ($b) => (float) ($b->release?->amount ?? 0));

            $pendingReleases = $items->filter(fn ($b) => $b->release?->status === 'pending')->count();
            $unclaimedReleases = $items->filter(fn ($b) => $b->release?->status === 'unclaimed')->count();

            $firstItem = $items->first();
            $brgyCode = $firstItem->historical_brgy_code ?? null;

            $percentage = $totalMunicipalDisbursed > 0
                ? round(($disbursedAmount / $totalMunicipalDisbursed) * 100, 1)
                : 0;

            $list[] = [
                'barangay_name' => $brgyName,
                'barangay_code' => $brgyCode,
                'enrolled_students' => $enrolled,
                'approved_students' => $approved,
                'rejected_students' => $rejected,
                'pending_students' => $pending,
                'given_students' => $givenStudents,
                'disbursed_amount' => $disbursedAmount,
                'pending_releases' => $pendingReleases,
                'unclaimed_releases' => $unclaimedReleases,
                'percentage_of_total_disbursed' => $percentage,
            ];
        }

        // Sort by given_students desc, then by enrolled_students desc
        usort($list, function ($a, $b) {
            if ($b['given_students'] === $a['given_students']) {
                return $b['enrolled_students'] <=> $a['enrolled_students'];
            }
            return $b['given_students'] <=> $a['given_students'];
        });

        $barangaysGivenCount = count(array_filter($list, fn ($b) => $b['given_students'] > 0));

        return [
            'total_barangays_count' => count($list),
            'barangays_given_count' => $barangaysGivenCount,
            'barangays_pending_count' => count(array_filter($list, fn ($b) => $b['given_students'] === 0 && $b['enrolled_students'] > 0)),
            'items' => $list,
        ];
    }

    /**
     * Compile student breakdown by educational status, school, and gender.
     *
     * @param Collection<int, CashIncentiveBeneficiary> $beneficiaries
     * @return array<string, mixed>
     */
    protected function compileStudentBreakdown(Collection $beneficiaries): array
    {
        // 1. By Educational Status
        $byEdu = $beneficiaries->groupBy(function ($b) {
            return $b->historical_educational_status ?: 'Not Specified';
        })->map(function ($items, $status) {
            $given = $items->filter(fn ($b) => $b->release?->status === 'released');
            return [
                'status_name' => $status,
                'enrolled_count' => $items->count(),
                'given_count' => $given->count(),
                'disbursed_amount' => (float) $given->sum(fn ($b) => (float) ($b->release?->amount ?? 0)),
            ];
        })->values()->sortByDesc('given_count')->values()->all();

        // 2. By School
        $bySchool = $beneficiaries->groupBy(function ($b) {
            return $b->historical_school_name ?: 'Other / Unspecified';
        })->map(function ($items, $school) {
            $given = $items->filter(fn ($b) => $b->release?->status === 'released');
            return [
                'school_name' => $school,
                'enrolled_count' => $items->count(),
                'given_count' => $given->count(),
                'disbursed_amount' => (float) $given->sum(fn ($b) => (float) ($b->release?->amount ?? 0)),
            ];
        })->values()->sortByDesc('given_count')->values()->take(10)->all();

        // 3. By Sex / Gender
        $bySex = $beneficiaries->groupBy(function ($b) {
            return $b->youthProfile?->sex ?: 'Unspecified';
        })->map(function ($items, $sex) {
            $given = $items->filter(fn ($b) => $b->release?->status === 'released');
            return [
                'sex' => $sex,
                'enrolled_count' => $items->count(),
                'given_count' => $given->count(),
                'disbursed_amount' => (float) $given->sum(fn ($b) => (float) ($b->release?->amount ?? 0)),
            ];
        })->values()->all();

        return [
            'by_educational_status' => $byEdu,
            'by_school' => $bySchool,
            'by_sex' => $bySex,
        ];
    }

    /**
     * Export reports to CSV.
     */
    public function exportCsv(array $filters = [], string $type = 'barangay'): StreamedResponse
    {
        $data = $this->getReportsData($filters);
        $filename = sprintf('mydo-%s-report-%s.csv', $type, date('Ymd-His'));

        return response()->streamDownload(function () use ($data, $type) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ["MUNICIPAL YOUTH DEVELOPMENT OFFICE (MYDO)"]);
            fputcsv($handle, ["Report Type: " . ucfirst($type) . " Report"]);
            fputcsv($handle, ["Generated At: " . now()->format('Y-m-d H:i:s')]);
            fputcsv($handle, []);

            if ($type === 'financial') {
                fputcsv($handle, ["FINANCIAL REPORT - MONTHLY SUMMARY"]);
                fputcsv($handle, ['Month', 'Students Assisted', 'Releases Count', 'Disbursed Amount (PHP)', 'Average Per Student (PHP)']);
                foreach ($data['financial']['monthly'] as $m) {
                    fputcsv($handle, [
                        $m['month_name'],
                        $m['students_count'],
                        $m['releases_count'],
                        number_format($m['disbursed_amount'], 2, '.', ''),
                        number_format($m['average_per_student'], 2, '.', ''),
                    ]);
                }

                fputcsv($handle, []);
                fputcsv($handle, ["FINANCIAL REPORT - YEARLY SUMMARY"]);
                fputcsv($handle, ['Year', 'Allocated Budget (PHP)', 'Disbursed Amount (PHP)', 'Remaining Balance (PHP)', 'Students Assisted', 'Utilization Rate (%)']);
                foreach ($data['financial']['yearly'] as $y) {
                    fputcsv($handle, [
                        $y['year'],
                        number_format($y['allocated_budget'], 2, '.', ''),
                        number_format($y['disbursed_amount'], 2, '.', ''),
                        number_format($y['remaining_budget'], 2, '.', ''),
                        $y['students_count'],
                        $y['utilization_rate'] . '%',
                    ]);
                }
            } else {
                fputcsv($handle, ["BARANGAY DISTRIBUTION REPORT"]);
                fputcsv($handle, ['Barangay Name', 'Barangay Code', 'Enrolled Students', 'Approved Students', 'Given Cash Incentives (Count)', 'Total Disbursed (PHP)', 'Pending Releases', 'Disbursement Share (%)']);
                foreach ($data['barangays']['items'] as $b) {
                    fputcsv($handle, [
                        $b['barangay_name'],
                        $b['barangay_code'] ?? '-',
                        $b['enrolled_students'],
                        $b['approved_students'],
                        $b['given_students'],
                        number_format($b['disbursed_amount'], 2, '.', ''),
                        $b['pending_releases'],
                        $b['percentage_of_total_disbursed'] . '%',
                    ]);
                }
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
