<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use App\Models\CashIncentiveBeneficiary;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class YouthCashIncentiveController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth('youth')->user();

        $selectedYear = $request->input('year');

        $query = CashIncentiveBeneficiary::with(['program', 'release'])
            ->where('youth_profile_id', $user->id);

        if ($selectedYear && $selectedYear !== 'all') {
            $query->whereHas('program', function ($q) use ($selectedYear) {
                $q->where('funding_year', (int) $selectedYear);
            });
        }

        $records = $query->orderByDesc('id')->get();

        // Distinct years for which this youth has incentive records
        $availableYears = CashIncentiveBeneficiary::where('youth_profile_id', $user->id)
            ->join('cash_incentive_programs', 'cash_incentive_beneficiaries.program_id', '=', 'cash_incentive_programs.id')
            ->distinct()
            ->orderByDesc('cash_incentive_programs.funding_year')
            ->pluck('cash_incentive_programs.funding_year')
            ->values();

        // Calculate summary figures
        $totalReceived = $records->reduce(function ($sum, $b) {
            if ($b->release && $b->release->status === 'released') {
                return $sum + (float) $b->release->amount;
            }
            return $sum;
        }, 0.0);

        $totalApproved = $records->where('status', 'approved')->count();
        $totalReleased = $records->filter(fn ($b) => $b->release && $b->release->status === 'released')->count();
        $totalPending = $records->filter(function ($b) {
            return $b->status === 'pending' || ($b->release && in_array($b->release->status, ['pending', 'scheduled']));
        })->count();

        return Inertia::render('youth/cash-incentives/youth-cash-incentives-page', [
            'records' => $records,
            'availableYears' => $availableYears,
            'selectedYear' => $selectedYear ?: 'all',
            'stats' => [
                'total_received' => $totalReceived,
                'total_records' => $records->count(),
                'total_approved' => $totalApproved,
                'total_released' => $totalReleased,
                'total_pending' => $totalPending,
            ],
        ]);
    }
}
