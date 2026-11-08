<?php

namespace App\Http\Controllers\Admin\CashIncentives;

use App\Http\Controllers\Controller;
use App\Http\Requests\CashIncentives\ReviewBeneficiaryRequest;
use App\Http\Requests\CashIncentives\SelectBeneficiariesRequest;
use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Services\CashIncentives\BeneficiaryApprovalService;
use App\Services\CashIncentives\BeneficiarySelectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCashIncentiveBeneficiaryController extends Controller
{
    public function __construct(
        protected BeneficiarySelectionService $selectionService,
        protected BeneficiaryApprovalService $approvalService
    ) {}

    /**
     * Get JSON list of eligible youth profiles available for selection into this program.
     */
    public function eligibleYouth(Request $request, CashIncentiveProgram $program): JsonResponse
    {
        $filters = [
            'search' => $request->input('search'),
            'brgy_code' => $request->input('brgy_code'),
            'educational_status' => $request->input('educational_status'),
            'year_level' => $request->input('year_level'),
            'sex' => $request->input('sex'),
            'per_page' => $request->input('per_page', 10),
        ];

        $paginator = $this->selectionService->getAvailableYouthPool($program, $filters);

        $data = $paginator->through(function ($youth) {
            return [
                'id' => $youth->id,
                'reference_code' => $youth->reference_code,
                'student_id' => $youth->student_id,
                'full_name' => trim(implode(' ', array_filter([$youth->fname, $youth->mname, $youth->lname, $youth->suffix]))),
                'email' => $youth->email,
                'mobile_number' => $youth->mobile_number,
                'sex' => $youth->sex,
                'birth_date' => $youth->birth_date?->format('M d, Y'),
                'civil_status' => $youth->civil_status,
                'monthly_family_income' => $youth->monthly_family_income,
                'barangay' => $youth->barangay?->brgyDesc ?? 'N/A',
                'brgy_code' => $youth->brgyCode,
                'school_name' => $youth->school_name ?? 'N/A',
                'program' => $youth->program ?? 'N/A',
                'year_level' => $youth->year,
                'is_graduated' => (bool) $youth->is_graduated,
                'educational_status' => $this->selectionService->resolveEducationalStatus($youth),
            ];
        });

        return response()->json($data);
    }

    /**
     * Select a youth profile into the program.
     */
    public function select(SelectBeneficiariesRequest $request, CashIncentiveProgram $program)
    {
        $actor = $request->user();
        $remarks = $request->validated('remarks');

        if ($request->filled('youth_profile_ids') && is_array($request->input('youth_profile_ids'))) {
            $ids = $request->input('youth_profile_ids');
            $added = 0;
            foreach ($ids as $id) {
                try {
                    $this->selectionService->selectBeneficiary($program, (int) $id, $actor, $remarks);
                    $added++;
                } catch (\Exception $e) {
                    // skip duplicate or limit errors for remaining batch
                }
            }
            return back()->with('success', "{$added} youth beneficiaries selected successfully.");
        }

        $this->selectionService->selectBeneficiary(
            $program,
            (int) $request->validated('youth_profile_id'),
            $actor,
            $remarks
        );

        return back()->with('success', 'Youth member selected successfully for eligibility review.');
    }

    /**
     * Review an individual beneficiary (Approve or Reject).
     */
    public function review(
        ReviewBeneficiaryRequest $request,
        CashIncentiveProgram $program,
        CashIncentiveBeneficiary $beneficiary
    ) {
        if ($beneficiary->program_id !== $program->id) {
            abort(404);
        }

        $this->approvalService->reviewBeneficiary(
            $beneficiary,
            $request->validated('status'),
            $request->user(),
            $request->validated('rejection_reason'),
            $request->validated('remarks')
        );

        $action = $request->validated('status') === 'approved' ? 'approved' : 'rejected';
        return back()->with('success', "Beneficiary {$action} successfully.");
    }

    /**
     * Remove a pending or rejected beneficiary.
     */
    public function destroy(
        Request $request,
        CashIncentiveProgram $program,
        CashIncentiveBeneficiary $beneficiary
    ) {
        if ($beneficiary->program_id !== $program->id) {
            abort(404);
        }

        $reason = $request->input('reason', 'Removed by admin');
        $this->selectionService->removeBeneficiary($beneficiary, $request->user(), $reason);

        return back()->with('success', 'Beneficiary removed from program.');
    }
}
