<?php

namespace App\Http\Controllers\Staff\CashIncentives;

use App\Http\Controllers\Controller;
use App\Http\Requests\CashIncentives\RecordCashReleaseRequest;
use App\Http\Requests\CashIncentives\UpdateReleaseStatusRequest;
use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Models\CashIncentiveRelease;
use App\Services\CashIncentives\CashReleaseService;
use Illuminate\Http\Request;

class StaffCashIncentiveReleaseController extends Controller
{
    public function __construct(
        protected CashReleaseService $releaseService
    ) {}

    /**
     * Record actual financial release to a beneficiary.
     */
    public function record(
        RecordCashReleaseRequest $request,
        CashIncentiveProgram $program,
        CashIncentiveBeneficiary $beneficiary
    ) {
        if ($beneficiary->program_id !== $program->id) {
            abort(404);
        }

        $release = $this->releaseService->recordCashRelease(
            $beneficiary,
            $request->validated(),
            $request->user()
        );

        return back()->with('success', "Cash incentive of ₱" . number_format($release->amount, 2) . " released successfully.");
    }

    /**
     * Batch record cash releases for multiple checked beneficiaries.
     */
    public function batch(Request $request, CashIncentiveProgram $program)
    {
        $validated = $request->validate([
            'beneficiary_ids' => ['required', 'array', 'min:1'],
            'beneficiary_ids.*' => ['integer', 'exists:cash_incentive_beneficiaries,id'],
            'acknowledgment_reference' => ['nullable', 'string', 'max:100'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $disbursed = $this->releaseService->batchRecordRelease(
            $program,
            $validated['beneficiary_ids'],
            $request->user(),
            $validated['acknowledgment_reference'] ?? null,
            $validated['remarks'] ?? null
        );

        return back()->with('success', "{$disbursed} cash incentives marked as released successfully.");
    }

    /**
     * Revert / undo a release back to pending.
     */
    public function revert(Request $request, CashIncentiveProgram $program, CashIncentiveBeneficiary $beneficiary)
    {
        if ($beneficiary->program_id !== $program->id) {
            abort(404);
        }

        $reason = $request->input('reason', 'Reverted by staff');
        $this->releaseService->revertCashRelease($beneficiary, $request->user(), $reason);

        return back()->with('success', 'Disbursement reverted back to pending.');
    }

    /**
     * Update release status (schedule, mark unclaimed, or administrative cancellation).
     */
    public function updateStatus(
        UpdateReleaseStatusRequest $request,
        CashIncentiveProgram $program,
        CashIncentiveRelease $release
    ) {
        if ($release->program_id !== $program->id) {
            abort(404);
        }

        $this->releaseService->updateReleaseStatus(
            $release,
            $request->validated('status'),
            $request->user(),
            $request->validated()
        );

        return back()->with('success', "Release status updated to {$request->validated('status')}.");
    }
}
