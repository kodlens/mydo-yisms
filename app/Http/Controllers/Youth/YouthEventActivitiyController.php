<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\YouthProfile;
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
        $user = auth('youth')->user();

        // Ensure current user has a reference code
        if ($user && empty($user->reference_code)) {
            $user->reference_code = YouthProfile::generateUniqueReferenceCode();
            $user->save();
        }

        // has_joined covers pending too, because a sign-up awaiting review still holds a
        // slot. A separate flag tells the youth whether they are confirmed yet.
        $query = Activity::with('category:id,name')
            ->withExists(['registrations as has_joined' => function ($query) {
                $query->where('youth_profile_id', auth('youth')->id())
                    ->reservingSlot();
            }])
            ->withExists(['registrations as is_approved' => function ($query) {
                $query->where('youth_profile_id', auth('youth')->id())
                    ->where('status', 'approved');
            }])
            ->withExists(['attendances as has_attended' => function ($query) {
                $query->where('youth_profile_id', auth('youth')->id());
            }])
            ->withCount(['registrations as participants_count' => function ($query) {
                $query->reservingSlot();
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
                    ->whereIn('status', ['pending', 'approved', 'rejected', 'cancelled']);
            })
            ->with(['registrations' => function ($query) {
                $query->where('youth_profile_id', auth('youth')->id())
                    ->select('id', 'activity_id', 'status', 'registered_at', 'cancelled_at', 'rejection_reason');
            }])
            ->with(['attendances' => function ($query) {
                $query->where('youth_profile_id', auth('youth')->id())
                    ->select('id', 'activity_id', 'method', 'attended_at');
            }])
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('youth/event-activities/youth-event-activities-page', [
            'activities' => $activities,
            'myActivities' => $myActivities,
            'youthPass' => $user ? [
                'id' => $user->id,
                'reference_code' => $user->reference_code,
                'full_name' => trim("{$user->fname} {$user->mname} {$user->lname} {$user->suffix}") ?: 'Youth Member',
                'student_id' => $user->student_id,
                'email' => $user->email,
                'barangay' => $user->brgyCode,
            ] : null,
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
            // Honour the activity's approval setting: sign-ups that need review wait
            // in the staff queue instead of being confirmed on the spot.
            $registration->status = $activity->requires_approval ? 'pending' : 'approved';
            $registration->registered_at = $now;
            $registration->cancelled_at = null;
            $registration->reviewed_by = null;
            $registration->reviewed_at = null;
            $registration->rejection_reason = null;
            $registration->save();
        });

        return to_route('youth.youth-services.events-activities.index');
    }

    public function cancel(Request $request, int $activity): RedirectResponse
    {
        DB::transaction(function () use ($request, $activity) {
            $activity = Activity::whereKey($activity)->lockForUpdate()->firstOrFail();
            $youthId = $request->user('youth')->id;

            $registration = $activity->registrations()
                ->where('youth_profile_id', $youthId)->firstOrFail();

            if ($registration->status === 'cancelled') {
                return;
            }

            // Lock 1: Permanent disable if attendance has already been recorded
            $hasAttended = $activity->attendances()
                ->where('youth_profile_id', $youthId)
                ->exists();

            if ($hasAttended) {
                throw ValidationException::withMessages([
                    'activity' => 'Participation cannot be cancelled because your attendance has already been recorded for this activity.',
                ]);
            }

            // Lock 2: Once activity officially starts or closes, cancellation is disabled
            $now = now('UTC');
            if (! in_array($registration->status, ['pending', 'approved'])
                || $activity->starts_at <= $now || $activity->ends_at <= $now
                || ($activity->registration_closes_at && $activity->registration_closes_at <= $now)) {
                throw ValidationException::withMessages([
                    'activity' => 'Participation can only be cancelled before registration closes and before the activity officially starts.',
                ]);
            }

            $registration->status = 'cancelled';
            $registration->cancelled_at = $now;
            $registration->save();
        });

        return to_route('youth.youth-services.events-activities.index');
    }
}
