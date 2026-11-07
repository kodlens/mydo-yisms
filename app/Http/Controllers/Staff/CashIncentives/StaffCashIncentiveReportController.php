<?php

namespace App\Http\Controllers\Staff\CashIncentives;

use App\Http\Controllers\Controller;
use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Services\CashIncentives\CashIncentiveReportService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StaffCashIncentiveReportController extends Controller
{
    public function __construct(
        protected CashIncentiveReportService $reportService
    ) {}

    /**
     * Return JSON analytics for the program reports tab.
     */
    public function summary(CashIncentiveProgram $program): JsonResponse
    {
        $reports = $this->reportService->getProgramReports($program);

        return response()->json($reports);
    }

    /**
     * Download comprehensive distribution CSV.
     */
    public function exportCsv(CashIncentiveProgram $program): StreamedResponse
    {
        return $this->reportService->exportCsv($program);
    }

    /**
     * View or print individual beneficiary distribution dossier.
     */
    public function individual(CashIncentiveProgram $program, CashIncentiveBeneficiary $beneficiary): Response
    {
        if ($beneficiary->program_id !== $program->id) {
            abort(404);
        }

        $report = $this->reportService->getIndividualBeneficiaryReport($beneficiary);

        return Inertia::render('staff/cash-incentives/staff-cash-incentive-beneficiary-report-page', [
            'report' => $report,
        ]);
    }
}
