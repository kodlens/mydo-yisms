<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Services\Staff\StaffReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StaffReportController extends Controller
{
    public function __construct(
        protected StaffReportService $reportService
    ) {}

    /**
     * Render the staff reports analytics & summary view.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'program_id' => $request->query('program_id'),
            'year' => $request->query('year'),
        ];

        $reportData = $this->reportService->getReportsData($filters);

        return Inertia::render('staff/reports/staff-reports-page', [
            'reportData' => $reportData,
        ]);
    }

    /**
     * Return JSON for asynchronous updates or queries.
     */
    public function data(Request $request): JsonResponse
    {
        $filters = [
            'program_id' => $request->query('program_id'),
            'year' => $request->query('year'),
        ];

        return response()->json($this->reportService->getReportsData($filters));
    }

    /**
     * Export reports to CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $filters = [
            'program_id' => $request->query('program_id'),
            'year' => $request->query('year'),
        ];

        $type = $request->query('type', 'barangay');

        return $this->reportService->exportCsv($filters, $type);
    }
}
