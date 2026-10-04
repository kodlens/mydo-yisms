<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Volunteer;
use App\Models\VolunteerActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class YouthVolunteerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('youth/services/volunteering/youth-volunteer-page');
    }

    /**
     * Everything the volunteer page needs for the signed-in youth: their volunteer
     * record, credited service hours, and each assignment with its attendance.
     */
    public function getData()
    {
        $profile = Auth::guard('youth')->user();

        $volunteer = Volunteer::with('youthProfile')
            ->where('youth_profile_id', $profile->id)
            ->withCount('assignments')
            ->withServiceHours()
            ->first();

        $assignments = $volunteer
            ? $volunteer->assignments()
                ->with(['activity.category', 'attendance'])
                ->orderByDesc('assigned_at')
                ->get()
                ->map(fn (VolunteerActivity $assignment) => [
                    'id' => $assignment->id,
                    'activity_title' => $assignment->activity?->title,
                    'activity_category' => $assignment->activity?->category?->name,
                    'activity_starts_at' => optional($assignment->activity?->starts_at)->toIso8601String(),
                    'venue_name' => $assignment->activity?->venue_name,
                    'role' => $assignment->role,
                    'status' => $assignment->status,
                    'hours_rendered' => $assignment->attendance?->hours_rendered === null
                        ? null
                        : (float) $assignment->attendance->hours_rendered,
                ])
                ->values()
            : [];

        // Open activities a volunteer could be assigned to, so the page is not a dead end.
        $openActivities = Activity::query()
            ->where('status', 'published')
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->orderBy('starts_at')
            ->limit(6)
            ->get(['id', 'title', 'venue_name', 'starts_at', 'ends_at', 'is_featured'])
            ->map(fn (Activity $activity) => [
                'id' => $activity->id,
                'title' => $activity->title,
                'venue_name' => $activity->venue_name,
                'starts_at' => optional($activity->starts_at)->toIso8601String(),
                'is_featured' => $activity->is_featured,
            ]);

        return response()->json([
            'success' => true,
            'profile' => [
                'fname' => $profile->fname,
                'lname' => $profile->lname,
                'email' => $profile->email,
            ],
            'volunteer' => $volunteer ? [
                'id' => $volunteer->id,
                'status' => $volunteer->status,
                'skills' => $volunteer->skills,
                'motivation' => $volunteer->motivation,
                'registered_at' => optional($volunteer->registered_at)->toIso8601String(),
                'total_hours' => round((float) ($volunteer->total_hours ?? 0), 2),
                'assignments_count' => (int) ($volunteer->assignments_count ?? 0),
            ] : null,
            'assignments' => $assignments,
            'open_activities' => $openActivities,
        ]);
    }

    /**
     * A youth opts into the volunteer program. The record starts as pending so the
     * MYDO can review it before assigning anyone to community work.
     */
    public function store(Request $req)
    {
        $profile = Auth::guard('youth')->user();

        $validated = $req->validate([
            'motivation' => ['required', 'string', 'min:10', 'max:2000'],
            'skills' => ['nullable', 'string', 'max:255'],
            'availability' => ['nullable', 'string', 'max:255'],
            'emergency_contact_name' => ['required', 'string', 'max:100'],
            'emergency_contact_number' => ['required', 'string', 'max:30'],
        ], [
            'motivation.required' => 'Tell us why you want to volunteer.',
            'motivation.min' => 'Please write at least 10 characters.',
            'emergency_contact_name.required' => 'Enter an emergency contact name.',
            'emergency_contact_number.required' => 'Enter an emergency contact number.',
        ]);

        // One volunteer record per youth; return the existing one instead of erroring.
        if ($profile->volunteerRecord()->exists()) {
            return response()->json([
                'message' => 'You are already registered as a volunteer.',
                'success' => false,
            ], 422);
        }

        $volunteer = Volunteer::create([
            'youth_profile_id' => $profile->id,
            'status' => 'pending',
            'motivation' => trim($validated['motivation']),
            'skills' => $this->blankToNull($validated['skills'] ?? null),
            'availability' => $this->blankToNull($validated['availability'] ?? null),
            'emergency_contact_name' => trim($validated['emergency_contact_name']),
            'emergency_contact_number' => trim($validated['emergency_contact_number']),
            'registered_at' => now(),
        ]);

        return response()->json([
            'message' => 'Your volunteer application has been submitted for review.',
            'success' => true,
            'data' => $volunteer,
        ], 201);
    }

    private function blankToNull(?string $value): ?string
    {
        return $value === null || trim($value) === '' ? null : trim($value);
    }
}
