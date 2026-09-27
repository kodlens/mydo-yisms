<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Inertia\Inertia;
use Inertia\Response;

class YouthEventActivitiyController extends Controller
{
    public function index(): Response
    {
        $activities = Activity::with('category:id,name')
            ->withCount(['registrations as participants_count' => function ($query) {
                $query->whereIn('status', ['pending', 'approved']);
            }])
            ->where('status', 'published')
            ->where('published_at', '<=', now('UTC'))
            ->where('ends_at', '>', now('UTC'))
            ->whereHas('category', fn ($query) => $query->where('is_active', true))
            ->orderBy('starts_at')
            ->orderBy('id')
            ->get();

        return Inertia::render('youth/event-activities/youth-event-activities-page', [
            'activities' => $activities,
        ]);
    }
}
