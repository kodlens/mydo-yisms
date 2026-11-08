<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminActivityLogController extends Controller
{
    /**
     * Display the activity logs management page.
     */
    public function index(Request $request): Response
    {
        $todayStart = Carbon::today();

        $stats = [
            'total_logs' => ActivityLog::query()->count(),
            'logs_today' => ActivityLog::query()->where('created_at', '>=', $todayStart)->count(),
            'distinct_actors' => ActivityLog::query()->distinct('user_id')->count('user_id'),
            'distinct_actions' => ActivityLog::query()->distinct('action')->count('action'),
        ];

        $availableRoles = ActivityLog::query()
            ->select('actor_role')
            ->distinct()
            ->whereNotNull('actor_role')
            ->pluck('actor_role')
            ->values();

        $availableActions = ActivityLog::query()
            ->select('action')
            ->distinct()
            ->whereNotNull('action')
            ->pluck('action')
            ->values();

        return Inertia::render('admin/activity-logs/admin-activity-logs-page', [
            'stats' => $stats,
            'availableRoles' => $availableRoles,
            'availableActions' => $availableActions,
        ]);
    }

    /**
     * Get paginated and filtered activity logs.
     */
    public function getData(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);
        $search = trim((string) $request->input('search', ''));
        $role = $request->input('role');
        $action = $request->input('action');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $query = ActivityLog::query()->with('user:id,email,fname,lname,role');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('actor_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhere('subject_type', 'like', "%{$search}%");
            });
        }

        if (!empty($role) && $role !== 'all') {
            $query->where('actor_role', $role);
        }

        if (!empty($action) && $action !== 'all') {
            $query->where('action', $action);
        }

        if (!empty($fromDate)) {
            $query->where('created_at', '>=', Carbon::parse($fromDate)->startOfDay());
        }

        if (!empty($toDate)) {
            $query->where('created_at', '<=', Carbon::parse($toDate)->endOfDay());
        }

        $logs = $query->orderBy('id', 'desc')->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Get a single activity log detail.
     */
    public function show($id): JsonResponse
    {
        $log = ActivityLog::with('user:id,email,fname,lname,role')->findOrFail($id);

        return response()->json($log);
    }
}
