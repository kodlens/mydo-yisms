<?php

namespace App\Http\Controllers\Admin\CashIncentives;

use App\Http\Controllers\Controller;
use App\Http\Requests\CashIncentives\StoreCashIncentiveProgramRequest;
use App\Http\Requests\CashIncentives\UpdateCashIncentiveProgramRequest;
use App\Models\Barangay;
use App\Models\CashIncentiveProgram;
use App\Services\CashIncentives\ProgramManagementService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCashIncentiveProgramController extends Controller
{
    public function __construct(
        protected ProgramManagementService $programService
    ) {}

    public function index(Request $request): Response
    {
        $year = $request->input('funding_year');
        $status = $request->input('status');
        $search = trim((string) $request->input('search', ''));

        $query = CashIncentiveProgram::query()
            ->with(['createdBy'])
            ->withCount([
                'beneficiaries as total_beneficiaries_count',
                'beneficiaries as approved_beneficiaries_count' => fn($q) => $q->where('status', 'approved'),
                'releases as released_count' => fn($q) => $q->where('status', 'released'),
            ]);

        if (!empty($year)) {
            $query->where('funding_year', (int) $year);
        }

        if (!empty($status)) {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $programs = $query->latest()->paginate(10)->through(function ($program) {
            $releasedAmount = (float) $program->releases()->where('status', 'released')->sum('amount');
            $allocatedBudget = (float) $program->allocated_budget;

            return [
                'id' => $program->id,
                'code' => $program->code,
                'title' => $program->title,
                'description' => $program->description,
                'funding_year' => $program->funding_year,
                'amount_per_beneficiary' => (float) $program->amount_per_beneficiary,
                'allocated_budget' => $allocatedBudget,
                'max_beneficiaries' => $program->max_beneficiaries,
                'status' => $program->status,
                'selection_start_date' => $program->selection_start_date?->format('Y-m-d'),
                'selection_end_date' => $program->selection_end_date?->format('Y-m-d'),
                'release_start_date' => $program->release_start_date?->format('Y-m-d'),
                'release_end_date' => $program->release_end_date?->format('Y-m-d'),
                'created_at' => $program->created_at->format('M d, Y'),
                'total_beneficiaries_count' => $program->total_beneficiaries_count,
                'approved_beneficiaries_count' => $program->approved_beneficiaries_count,
                'released_count' => $program->released_count,
                'released_amount' => $releasedAmount,
                'remaining_budget' => max(0, $allocatedBudget - $releasedAmount),
                'budget_utilization_rate' => $allocatedBudget > 0 ? round(($releasedAmount / $allocatedBudget) * 100, 1) : 0,
            ];
        });

        // Global KPI Stats
        $allPrograms = CashIncentiveProgram::all();
        $totalAllocated = (float) $allPrograms->sum('allocated_budget');
        $totalReleased = (float) \App\Models\CashIncentiveRelease::where('status', 'released')->sum('amount');
        $totalApproved = \App\Models\CashIncentiveBeneficiary::where('status', 'approved')->count();
        $totalDisbursedCount = \App\Models\CashIncentiveRelease::where('status', 'released')->count();

        return Inertia::render('admin/cash-incentives/admin-cash-incentives-index-page', [
            'programs' => $programs,
            'filters' => [
                'funding_year' => $year,
                'status' => $status,
                'search' => $search,
            ],
            'kpi' => [
                'total_programs' => $allPrograms->count(),
                'active_programs' => $allPrograms->where('status', 'active')->count(),
                'total_allocated_budget' => $totalAllocated,
                'total_released_amount' => $totalReleased,
                'remaining_balance' => max(0, $totalAllocated - $totalReleased),
                'total_approved_beneficiaries' => $totalApproved,
                'total_disbursed_count' => $totalDisbursedCount,
            ],
            'available_years' => CashIncentiveProgram::distinct()->pluck('funding_year')->sortDesc()->values(),
        ]);
    }

    public function store(StoreCashIncentiveProgramRequest $request)
    {
        $program = $this->programService->createProgram($request->validated(), $request->user());

        return redirect()->route('admin.cash-incentives.show', $program->id)
            ->with('success', "Cash incentive program '{$program->title}' created successfully.");
    }

    public function show(CashIncentiveProgram $program): Response
    {
        $summary = $this->programService->getProgramSummary($program);

        // Load beneficiaries with relations
        $beneficiaries = $program->beneficiaries()
            ->with([
                'youthProfile',
                'youthProfile.barangay',
                'selectedBy',
                'reviewedBy',
                'release',
                'release.releasedBy',
            ])
            ->latest('id')
            ->get()
            ->map(function ($b) use ($program) {
                $youth = $b->youthProfile;
                $release = $b->release;

                return [
                    'id' => $b->id,
                    'youth_profile_id' => $b->youth_profile_id,
                    'status' => $b->status,
                    'selected_at' => $b->selected_at?->format('M d, Y h:i A'),
                    'selected_by' => $b->selectedBy ? ($b->selectedBy->fname . ' ' . $b->selectedBy->lname) : null,
                    'reviewed_at' => $b->reviewed_at?->format('M d, Y h:i A'),
                    'reviewed_by' => $b->reviewedBy ? ($b->reviewedBy->fname . ' ' . $b->reviewedBy->lname) : null,
                    'rejection_reason' => $b->rejection_reason,
                    'remarks' => $b->remarks,

                    // Youth demographics
                    'reference_code' => $youth?->reference_code,
                    'student_id' => $youth?->student_id,
                    'full_name' => trim(implode(' ', array_filter([$youth?->fname, $youth?->mname, $youth?->lname, $youth?->suffix]))),
                    'sex' => $youth?->sex,
                    'civil_status' => $youth?->civil_status,
                    'mobile_number' => $youth?->mobile_number,
                    'email' => $youth?->email,
                    'monthly_family_income' => $youth?->monthly_family_income,
                    'barangay' => $b->historical_brgy_name ?: ($youth?->barangay?->brgyDesc ?? 'N/A'),
                    'school_name' => $b->historical_school_name ?: ($youth?->school_name ?? 'N/A'),
                    'program' => $b->historical_program ?: ($youth?->program ?? 'N/A'),
                    'educational_status' => $b->historical_educational_status,

                    // Release info
                    'release' => $release ? [
                        'id' => $release->id,
                        'status' => $release->status,
                        'amount' => (float) $release->amount,
                        'scheduled_release_date' => $release->scheduled_release_date?->format('Y-m-d'),
                        'actual_release_date' => $release->actual_release_date?->format('M d, Y h:i A'),
                        'acknowledgment_reference' => $release->acknowledgment_reference,
                        'supporting_document_url' => $release->supporting_document_path ? asset('storage/' . $release->supporting_document_path) : null,
                        'released_by' => $release->releasedBy ? ($release->releasedBy->fname . ' ' . $release->releasedBy->lname) : null,
                        'remarks' => $release->remarks,
                        'cancellation_reason' => $release->cancellation_reason,
                    ] : null,
                ];
            });

        // Barangays list for filtering
        $barangays = Barangay::select('brgyCode', 'brgyDesc')
            ->orderBy('brgyDesc')
            ->limit(100)
            ->get();

        return Inertia::render('admin/cash-incentives/admin-cash-incentive-program-show-page', [
            'program' => [
                'id' => $program->id,
                'code' => $program->code,
                'title' => $program->title,
                'description' => $program->description,
                'funding_year' => $program->funding_year,
                'amount_per_beneficiary' => (float) $program->amount_per_beneficiary,
                'allocated_budget' => (float) $program->allocated_budget,
                'max_beneficiaries' => $program->max_beneficiaries,
                'selection_start_date' => $program->selection_start_date?->format('Y-m-d'),
                'selection_end_date' => $program->selection_end_date?->format('Y-m-d'),
                'release_start_date' => $program->release_start_date?->format('Y-m-d'),
                'release_end_date' => $program->release_end_date?->format('Y-m-d'),
                'status' => $program->status,
                'created_at' => $program->created_at->format('M d, Y'),
            ],
            'summary' => $summary,
            'beneficiaries' => $beneficiaries,
            'barangays' => $barangays,
        ]);
    }

    public function update(UpdateCashIncentiveProgramRequest $request, CashIncentiveProgram $program)
    {
        $this->programService->updateProgram($program, $request->validated(), $request->user());

        return back()->with('success', "Program configuration updated successfully.");
    }

    public function destroy(CashIncentiveProgram $program)
    {
        if ($program->status !== 'draft') {
            return back()->withErrors(['error' => 'Only draft programs with no active releases can be deleted.']);
        }

        if ($program->releases()->where('status', 'released')->exists()) {
            return back()->withErrors(['error' => 'Cannot delete a program that has active or released cash disbursements.']);
        }

        $program->delete();

        return redirect()->route('admin.cash-incentives.index')
            ->with('success', "Program deleted successfully.");
    }
}
