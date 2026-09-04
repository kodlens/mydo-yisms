<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

class StaffDashboardController extends Controller
{
    public function index(): Response
    {
        $statusCounts = Student::query()
            ->selectRaw('registration_status, count(*) as total')
            ->groupBy('registration_status')
            ->pluck('total', 'registration_status');

        $totalApplicants = Student::query()->count();
        $completedReviews = (int) ($statusCounts->get('approved', 0) + $statusCounts->get('rejected', 0));
        $reviewProgress = $totalApplicants > 0
            ? round(($completedReviews / $totalApplicants) * 100)
            : 0;

        return Inertia::render('staff/staff-dashboard-index', [
            'stats' => [
                'pending' => (int) $statusCounts->get('pending', 0),
                'approved' => (int) $statusCounts->get('approved', 0),
                'rejected' => (int) $statusCounts->get('rejected', 0),
                'draft' => (int) $statusCounts->get('draft', 0),
                'total' => $totalApplicants,
                'new_this_week' => Student::query()->where('created_at', '>=', now()->startOfWeek())->count(),
                'review_progress' => $reviewProgress,
            ],
            'queue' => Student::query()
                ->where('registration_status', 'pending')
                ->latest()
                ->limit(5)
                ->get(['id', 'fname', 'lname', 'program', 'school_name', 'registration_status']),
        ]);
    }
}
