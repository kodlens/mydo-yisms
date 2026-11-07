<?php

namespace App\Services\CashIncentives;

use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Models\CashIncentiveRelease;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CashIncentiveReportService
{
    /**
     * Compile complete reporting datasets for a program.
     */
    public function getProgramReports(CashIncentiveProgram $program): array
    {
        $program->load(['beneficiaries', 'beneficiaries.release']);

        $amountPerBeneficiary = (float) $program->amount_per_beneficiary;
        $beneficiaries = $program->beneficiaries;
        $totalBeneficiaries = $beneficiaries->count();

        // 1. By Barangay
        $barangayGroups = $beneficiaries->groupBy(function ($b) {
            return $b->historical_brgy_name ?: 'Unspecified';
        });

        $byBarangay = [];
        foreach ($barangayGroups as $brgyName => $items) {
            $selected = $items->count();
            $approved = $items->where('status', 'approved')->count();
            $rejected = $items->where('status', 'rejected')->count();
            $pending = $items->where('status', 'pending')->count();

            $releasedCount = $items->filter(fn($b) => $b->release?->status === 'released')->count();
            $releasedAmount = $releasedCount * $amountPerBeneficiary;
            $unclaimedCount = $items->filter(fn($b) => $b->release?->status === 'unclaimed')->count();

            $byBarangay[] = [
                'barangay_name' => $brgyName,
                'selected_count' => $selected,
                'approved_count' => $approved,
                'rejected_count' => $rejected,
                'pending_count' => $pending,
                'released_count' => $releasedCount,
                'unclaimed_count' => $unclaimedCount,
                'released_amount' => $releasedAmount,
                'percentage' => $totalBeneficiaries > 0 ? round(($selected / $totalBeneficiaries) * 100, 1) : 0,
            ];
        }

        // Sort barangays by selected count descending
        usort($byBarangay, fn($a, $b) => $b['selected_count'] <=> $a['selected_count']);

        // 2. By Educational Status
        $eduGroups = $beneficiaries->groupBy(function ($b) {
            return $b->historical_educational_status ?: 'Not Specified';
        });

        $byEducation = [];
        foreach ($eduGroups as $eduStatus => $items) {
            $count = $items->count();
            $approved = $items->where('status', 'approved')->count();
            $releasedCount = $items->filter(fn($b) => $b->release?->status === 'released')->count();
            $releasedAmount = $releasedCount * $amountPerBeneficiary;

            $byEducation[] = [
                'educational_status' => $eduStatus,
                'selected_count' => $count,
                'approved_count' => $approved,
                'released_count' => $releasedCount,
                'released_amount' => $releasedAmount,
                'percentage' => $totalBeneficiaries > 0 ? round(($count / $totalBeneficiaries) * 100, 1) : 0,
            ];
        }

        usort($byEducation, fn($a, $b) => $b['selected_count'] <=> $a['selected_count']);

        // 3. Approved vs Released Comparison
        $approvedCount = $beneficiaries->where('status', 'approved')->count();
        $releasedCount = $beneficiaries->filter(fn($b) => $b->release?->status === 'released')->count();
        $turnoutRate = $approvedCount > 0 ? round(($releasedCount / $approvedCount) * 100, 1) : 0;

        // 4. Pending & Unclaimed Releases List
        $pendingReleases = $beneficiaries
            ->filter(fn($b) => $b->status === 'approved' && in_array($b->release?->status, ['pending', 'scheduled'], true))
            ->values()
            ->map(fn($b) => $this->formatBeneficiaryRow($b));

        $unclaimedReleases = $beneficiaries
            ->filter(fn($b) => $b->release?->status === 'unclaimed')
            ->values()
            ->map(fn($b) => $this->formatBeneficiaryRow($b));

        // 5. Total Expected vs Actual Disbursed
        $expectedAmount = $approvedCount * $amountPerBeneficiary;
        $actualReleasedAmount = $releasedCount * $amountPerBeneficiary;
        $unreleasedCommitted = max(0, $expectedAmount - $actualReleasedAmount);

        return [
            'summary' => [
                'total_beneficiaries' => $totalBeneficiaries,
                'approved_count' => $approvedCount,
                'released_count' => $releasedCount,
                'turnout_rate' => $turnoutRate,
                'expected_amount' => $expectedAmount,
                'actual_released_amount' => $actualReleasedAmount,
                'unreleased_committed' => $unreleasedCommitted,
                'allocated_budget' => (float) $program->allocated_budget,
                'amount_per_beneficiary' => $amountPerBeneficiary,
            ],
            'by_barangay' => $byBarangay,
            'by_education' => $byEducation,
            'pending_releases' => $pendingReleases,
            'unclaimed_releases' => $unclaimedReleases,
        ];
    }

    /**
     * Get single individual beneficiary printable dossier / ledger.
     */
    public function getIndividualBeneficiaryReport(CashIncentiveBeneficiary $beneficiary): array
    {
        $beneficiary->load([
            'program',
            'youthProfile',
            'youthProfile.province',
            'youthProfile.city',
            'youthProfile.barangay',
            'selectedBy',
            'reviewedBy',
            'release',
            'release.releasedBy',
            'statusHistories',
            'statusHistories.actor',
        ]);

        $youth = $beneficiary->youthProfile;
        $program = $beneficiary->program;
        $release = $beneficiary->release;

        return [
            'beneficiary_id' => $beneficiary->id,
            'status' => $beneficiary->status,
            'selected_at' => $beneficiary->selected_at?->format('M d, Y h:i A'),
            'selected_by' => $beneficiary->selectedBy?->fname . ' ' . $beneficiary->selectedBy?->lname,
            'reviewed_at' => $beneficiary->reviewed_at?->format('M d, Y h:i A'),
            'reviewed_by' => $beneficiary->reviewedBy?->fname . ' ' . $beneficiary->reviewedBy?->lname,
            'rejection_reason' => $beneficiary->rejection_reason,
            'remarks' => $beneficiary->remarks,

            'youth' => [
                'id' => $youth?->id,
                'reference_code' => $youth?->reference_code,
                'student_id' => $youth?->student_id,
                'full_name' => trim(implode(' ', array_filter([$youth?->fname, $youth?->mname, $youth?->lname, $youth?->suffix]))),
                'email' => $youth?->email,
                'mobile_number' => $youth?->mobile_number,
                'sex' => $youth?->sex,
                'birth_date' => $youth?->birth_date?->format('M d, Y'),
                'civil_status' => $youth?->civil_status,
                'monthly_family_income' => $youth?->monthly_family_income,
                'address' => $youth?->street_address,
                'barangay' => $beneficiary->historical_brgy_name ?: ($youth?->barangay?->brgyDesc ?? 'N/A'),
                'city' => $youth?->city?->citymunDesc ?? 'N/A',
                'province' => $youth?->province?->provDesc ?? 'N/A',
                'school_name' => $beneficiary->historical_school_name ?: ($youth?->school_name ?? 'N/A'),
                'program' => $beneficiary->historical_program ?: ($youth?->program ?? 'N/A'),
                'educational_status' => $beneficiary->historical_educational_status,
            ],

            'program' => [
                'id' => $program->id,
                'code' => $program->code,
                'title' => $program->title,
                'funding_year' => $program->funding_year,
                'amount_per_beneficiary' => (float) $program->amount_per_beneficiary,
            ],

            'release' => $release ? [
                'id' => $release->id,
                'status' => $release->status,
                'amount' => (float) $release->amount,
                'scheduled_release_date' => $release->scheduled_release_date?->format('M d, Y'),
                'actual_release_date' => $release->actual_release_date?->format('M d, Y h:i A'),
                'acknowledgment_reference' => $release->acknowledgment_reference,
                'released_by' => $release->releasedBy?->fname . ' ' . $release->releasedBy?->lname,
                'supporting_document_url' => $release->supporting_document_path ? asset('storage/' . $release->supporting_document_path) : null,
                'remarks' => $release->remarks,
            ] : null,

            'audit_trail' => $beneficiary->statusHistories->sortByDesc('created_at')->values()->map(fn($h) => [
                'action_type' => $h->action_type,
                'from_status' => $h->from_status,
                'to_status' => $h->to_status,
                'reason' => $h->reason,
                'actor_name' => $h->actor_name,
                'created_at' => $h->created_at?->format('M d, Y h:i A'),
            ]),
        ];
    }

    /**
     * Generate downloadable CSV of beneficiaries and disbursement history.
     */
    public function exportCsv(CashIncentiveProgram $program): StreamedResponse
    {
        $beneficiaries = $program->beneficiaries()
            ->with(['youthProfile', 'release', 'selectedBy', 'reviewedBy'])
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"cash-incentives-{$program->code}-distribution.csv\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($program, $beneficiaries) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Program Info Header
            fputcsv($handle, ['PROGRAM DISTRIBUTION REPORT']);
            fputcsv($handle, ['Title', $program->title]);
            fputcsv($handle, ['Code', $program->code]);
            fputcsv($handle, ['Funding Year', $program->funding_year]);
            fputcsv($handle, ['Amount Per Beneficiary', number_format($program->amount_per_beneficiary, 2)]);
            fputcsv($handle, ['Allocated Budget', number_format($program->allocated_budget, 2)]);
            fputcsv($handle, []);

            // Column Headers
            fputcsv($handle, [
                '#',
                'Reference Code',
                'Student ID',
                'Last Name',
                'First Name',
                'Middle Name',
                'Suffix',
                'Barangay',
                'Educational Status',
                'School Name',
                'Program',
                'Eligibility Status',
                'Rejection Reason',
                'Release Status',
                'Disbursed Amount (PHP)',
                'Acknowledgment Reference',
                'Disbursement Date',
                'Disbursing Officer',
            ]);

            $i = 1;
            foreach ($beneficiaries as $b) {
                $youth = $b->youthProfile;
                $release = $b->release;

                fputcsv($handle, [
                    $i++,
                    $youth?->reference_code ?? 'N/A',
                    $youth?->student_id ?? 'N/A',
                    $youth?->lname ?? '',
                    $youth?->fname ?? '',
                    $youth?->mname ?? '',
                    $youth?->suffix ?? '',
                    $b->historical_brgy_name ?: ($youth?->brgyCode ?? 'N/A'),
                    $b->historical_educational_status ?? 'N/A',
                    $b->historical_school_name ?: ($youth?->school_name ?? 'N/A'),
                    $b->historical_program ?: ($youth?->program ?? 'N/A'),
                    ucfirst($b->status),
                    $b->rejection_reason ?? '',
                    $release ? ucfirst($release->status) : 'Not Scheduled',
                    $release && $release->status === 'released' ? number_format($release->amount, 2) : '0.00',
                    $release?->acknowledgment_reference ?? '',
                    $release?->actual_release_date?->format('Y-m-d H:i:s') ?? '',
                    $release?->releasedBy ? ($release->releasedBy->fname . ' ' . $release->releasedBy->lname) : '',
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    private function formatBeneficiaryRow(CashIncentiveBeneficiary $b): array
    {
        $youth = $b->youthProfile;
        $release = $b->release;

        return [
            'beneficiary_id' => $b->id,
            'youth_id' => $youth?->id,
            'reference_code' => $youth?->reference_code,
            'full_name' => trim(implode(' ', array_filter([$youth?->fname, $youth?->mname, $youth?->lname, $youth?->suffix]))),
            'barangay' => $b->historical_brgy_name ?: 'N/A',
            'educational_status' => $b->historical_educational_status ?: 'N/A',
            'school_name' => $b->historical_school_name ?: ($youth?->school_name ?? 'N/A'),
            'status' => $b->status,
            'release_status' => $release?->status ?? 'pending',
            'amount' => $release ? (float) $release->amount : (float) $b->program->amount_per_beneficiary,
            'scheduled_date' => $release?->scheduled_release_date?->format('M d, Y'),
            'acknowledgment_reference' => $release?->acknowledgment_reference,
            'actual_release_date' => $release?->actual_release_date?->format('M d, Y h:i A'),
        ];
    }
}
