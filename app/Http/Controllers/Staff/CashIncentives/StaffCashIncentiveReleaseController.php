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
     * Record actual financial release to an approved beneficiary.
     */
    public function record(
        RecordCashReleaseRequest $request,
        CashIncentiveProgram $program,
        CashIncentiveBeneficiary $beneficiary
    ) {
        if ($beneficiary->program_id !== $program->id) {
            abort(404);
        }

        $documentFile = $request->file('supporting_document');

        $release = $this->releaseService->recordCashRelease(
            $beneficiary,
            $request->validated(),
            $request->user(),
            $documentFile
        );

        return back()->with('success', "Cash release of ₱" . number_format($release->amount, 2) . " recorded successfully (Ref: {$release->acknowledgment_reference}).");
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
