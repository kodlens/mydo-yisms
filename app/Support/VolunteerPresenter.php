<?php

namespace App\Support;

use App\Models\Activity;
use App\Models\Volunteer;
use App\Models\VolunteerActivity;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Shared volunteer read model. The admin and staff panels list, review, and record
 * attendance on the same records, so the query and the payload shapes live here
 * instead of being duplicated across both controllers.
 */
class VolunteerPresenter
{
    /**
     * The volunteer list with search, status filter, and the aggregates the table shows.
     */
    public static function listing(string $search = '', string $status = '', int $perPage = 10, int $page = 1): LengthAwarePaginator
    {
        // Clamp the page size so a hand-crafted request cannot pull the whole table.
        $perPage = max(1, min(100, $perPage));

        return Volunteer::query()
            ->with('youthProfile')
            ->withCount('assignments')
            ->withServiceHours()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('skills', 'like', "%{$search}%")
                        ->orWhere('availability', 'like', "%{$search}%")
                        ->orWhereHas('youthProfile', function ($query) use ($search) {
                            $query->where('lname', 'like', "%{$search}%")
                                ->orWhere('fname', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('school_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array($status, ['pending', 'active', 'inactive'], true), fn ($query) => $query->where('status', $status))
            ->orderBy('id', 'desc')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString()
            ->through(fn (Volunteer $volunteer) => self::volunteer($volunteer));
    }

    public static function volunteer(Volunteer $volunteer): array
    {
        $profile = $volunteer->youthProfile;

        return [
            'id' => $volunteer->id,
            'youth_profile_id' => $volunteer->youth_profile_id,
            'full_name' => trim(($profile?->fname ?? '') . ' ' . ($profile?->lname ?? '')),
            'lname' => $profile?->lname,
            'fname' => $profile?->fname,
            'email' => $profile?->email,
            'mobile_number' => $profile?->mobile_number,
            'school_name' => $profile?->school_name,
            'brgyCode' => $profile?->brgyCode,
            'status' => $volunteer->status,
            'motivation' => $volunteer->motivation,
            'skills' => $volunteer->skills,
            'availability' => $volunteer->availability,
            'emergency_contact_name' => $volunteer->emergency_contact_name,
            'emergency_contact_number' => $volunteer->emergency_contact_number,
            'approved_at' => optional($volunteer->approved_at)->toIso8601String(),
            'registered_at' => optional($volunteer->registered_at)->toIso8601String(),
            'assignments_count' => (int) ($volunteer->assignments_count ?? 0),
            'total_hours' => round((float) ($volunteer->total_hours ?? 0), 2),
        ];
    }

    public static function assignment(VolunteerActivity $assignment): array
    {
        $attendance = $assignment->attendance;

        return [
            'id' => $assignment->id,
            'activity_id' => $assignment->activity_id,
            'activity_title' => $assignment->activity?->title,
            'activity_category' => $assignment->activity?->category?->name,
            'activity_starts_at' => optional($assignment->activity?->starts_at)->toIso8601String(),
            'activity_status' => $assignment->activity?->status,
            'role' => $assignment->role,
            'status' => $assignment->status,
            'assigned_at' => optional($assignment->assigned_at)->toIso8601String(),
            'attendance' => $attendance ? [
                'id' => $attendance->id,
                'time_in' => optional($attendance->time_in)->toIso8601String(),
                'time_out' => optional($attendance->time_out)->toIso8601String(),
                'hours_rendered' => $attendance->hours_rendered === null ? null : (float) $attendance->hours_rendered,
                'method' => $attendance->method,
                'remarks' => $attendance->remarks,
            ] : null,
        ];
    }

    /**
     * A volunteer's assignments plus the activities that can still take one.
     *
     * @return array{volunteer: array, assignments: array<int, array>, available_activities: array<int, array>}
     */
    public static function assignmentSheet(Volunteer $volunteer): array
    {
        $assignments = $volunteer->assignments()
            ->with(['activity.category', 'attendance'])
            ->orderByDesc('assigned_at')
            ->get()
            ->map(fn (VolunteerActivity $assignment) => self::assignment($assignment))
            ->values();

        // Activities that can still take volunteers. Finished and archived ones are excluded.
        $availableActivities = Activity::query()
            ->with('category')
            ->whereIn('status', ['published', 'draft'])
            ->orderByDesc('starts_at')
            ->limit(100)
            ->get(['id', 'title', 'status', 'starts_at', 'activity_category_id'])
            ->map(fn (Activity $activity) => [
                'id' => $activity->id,
                'title' => $activity->title,
                'status' => $activity->status,
                'starts_at' => optional($activity->starts_at)->toIso8601String(),
            ])
            ->values();

        return [
            'volunteer' => self::volunteer($volunteer),
            'assignments' => $assignments,
            'available_activities' => $availableActivities,
        ];
    }

    /**
     * Trim a value, treating an empty string as null so the API clears the field.
     */
    public static function blankToNull(?string $value): ?string
    {
        return $value === null || trim($value) === '' ? null : trim($value);
    }
}
