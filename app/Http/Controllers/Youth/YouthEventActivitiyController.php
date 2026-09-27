<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class YouthEventActivitiyController extends Controller
{
    public function index(): Response
    {
        $query = Activity::with('category:id,name')
            ->withExists(['registrations as has_joined' => function ($query) {
                $query->where('youth_profile_id', auth('youth')->id())
                    ->whereIn('status', ['pending', 'approved']);
            }])
            ->withCount(['registrations as participants_count' => function ($query) {
                $query->whereIn('status', ['pending', 'approved']);
            }]);

        $activities = (clone $query)->where('status', 'published')
            ->where('published_at', '<=', now('UTC'))
            ->where('ends_at', '>', now('UTC'))
            ->whereHas('category', fn ($query) => $query->where('is_active', true))
            ->orderBy('starts_at')
            ->orderBy('id')
            ->get();

        $myActivities = (clone $query)
            ->whereIn('status', ['published', 'cancelled', 'archived'])
            ->where('published_at', '<=', now('UTC'))
            ->whereHas('registrations', function ($query) {
                $query->where('youth_profile_id', auth('youth')->id())
                    ->whereIn('status', ['pending', 'approved', 'cancelled']);
            })
            ->with(['registrations' => function ($query) {
                $query->where('youth_profile_id', auth('youth')->id())
                    ->select('id', 'activity_id', 'status', 'registered_at', 'cancelled_at');
            }])
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('youth/event-activities/youth-event-activities-page', [
            'activities' => $activities,
            'myActivities' => $myActivities,
        ]);
    }

    public function join(Request $request, int $activity): RedirectResponse
    {
        DB::transaction(function () use ($request, $activity) {
            // Serialize sign-ups for this activity so the last slot cannot be overbooked.
            $activity = Activity::whereKey($activity)->lockForUpdate()->firstOrFail();
            $registration = $activity->registrations()
                ->where('youth_profile_id', $request->user('youth')->id)->first();

            if ($registration && in_array($registration->status, ['pending', 'approved'])) {
                return;
            }

            $now = now('UTC');
            if ($activity->status !== 'published' || ! $activity->published_at || $activity->published_at > $now
                || ! $activity->category->is_active || ! $activity->requires_registration) {
                throw ValidationException::withMessages(['activity' => 'This activity is not available for registration.']);
            }

            if ($activity->starts_at <= $now || $activity->ends_at <= $now || ($activity->registration_closes_at && $activity->registration_closes_at <= $now)) {
                throw ValidationException::withMessages(['activity' => 'Registration has closed for this activity.']);
            }

            if ($activity->registration_opens_at && $activity->registration_opens_at > $now) {
                throw ValidationException::withMessages(['activity' => 'Registration has not opened yet.']);
            }

            if ($registration && $registration->status === 'rejected') {
                throw ValidationException::withMessages(['activity' => 'Please contact the youth office about your registration.']);
            }

            $participants = $activity->registrations()->whereIn('status', ['pending', 'approved'])->count();
            if ($activity->capacity !== null && $participants >= $activity->capacity) {
                throw ValidationException::withMessages(['activity' => 'This activity is full. No slots are available.']);
            }

            $registration ??= $activity->registrations()->make();
            $registration->youth_profile_id = $request->user('youth')->id;
            // Joining is immediate for now; staff approval will be added separately.
            $registration->status = 'approved';
            $registration->registered_at = $now;
            $registration->cancelled_at = null;
            $registration->save();
        });

        return to_route('youth.youth-services.events-activities.index');
    }

    public function cancel(Request $request, int $activity): RedirectResponse
    {
        DB::transaction(function () use ($request, $activity) {
            $activity = Activity::whereKey($activity)->lockForUpdate()->firstOrFail();
            $registration = $activity->registrations()
                ->where('youth_profile_id', $request->user('youth')->id)->firstOrFail();

            if ($registration->status === 'cancelled') {
                return;
            }

            $now = now('UTC');
            if (! in_array($registration->status, ['pending', 'approved'])
                || $activity->starts_at <= $now || $activity->ends_at <= $now
                || ($activity->registration_closes_at && $activity->registration_closes_at <= $now)) {
                throw ValidationException::withMessages(['activity' => 'Participation can only be cancelled before registration closes and the activity starts.']);
            }

            $registration->status = 'cancelled';
            $registration->cancelled_at = $now;
            $registration->save();
        });

        return to_route('youth.youth-services.events-activities.index');
    }
}
