<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ScholarshipApplication;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
     public function index(): Response
    {
        $statusCounts = ScholarshipApplication::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $totalApplicants = ScholarshipApplication::query()->count();
        $completedReviews = (int) ($statusCounts->get('approved', 0) + $statusCounts->get('rejected', 0));
        $reviewProgress = $totalApplicants > 0
            ? round(($completedReviews / $totalApplicants) * 100)
            : 0;

        return Inertia::render('admin/admin-dashboard-page', [
            'stats' => [
                'pending' => (int) $statusCounts->get('pending', 0),
                'approved' => (int) $statusCounts->get('approved', 0),
                'rejected' => (int) $statusCounts->get('rejected', 0),
                'draft' => (int) $statusCounts->get('draft', 0),
                'total' => $totalApplicants,
                'new_this_week' => ScholarshipApplication::query()->where('created_at', '>=', now()->startOfWeek())->count(),
                'review_progress' => $reviewProgress,
            ],
            'queue' => ScholarshipApplication::query()
                ->with('youthProfile')
                ->where('status', 'pending')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (ScholarshipApplication $application) => [
                    'id' => $application->id,
                    'fname' => $application->youthProfile?->fname,
                    'lname' => $application->youthProfile?->lname,
                    'program' => $application->youthProfile?->program,
                    'school_name' => $application->youthProfile?->school_name,
                    'registration_status' => $application->status,
                ]),
        ]);
    }
}
