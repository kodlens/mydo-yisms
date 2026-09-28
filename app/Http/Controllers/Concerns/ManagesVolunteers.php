<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Volunteer;
use App\Models\VolunteerActivity;
use App\Support\VolunteerPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * The volunteer operations shared by the admin and staff panels. Both roles review
 * applications, assign volunteers, and record attendance, so those rules live here to
 * keep the two panels behaving identically. Registration and deletion of a volunteer
 * record are admin-only and stay in the admin controller.
 */
trait ManagesVolunteers
{
    public function assignments(Request $req, $id): JsonResponse
    {
        $volunteer = Volunteer::with('youthProfile')
            ->withCount('assignments')
            ->withServiceHours()
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            ...VolunteerPresenter::assignmentSheet($volunteer),
        ]);
    }

    public function update(Request $req, $id): JsonResponse
    {
        $volunteer = Volunteer::findOrFail($id);

        $validated = $req->validate([
            'motivation' => ['nullable', 'string', 'max:2000'],
            'skills' => ['nullable', 'string', 'max:255'],
            'availability' => ['nullable', 'string', 'max:255'],
            'emergency_contact_name' => ['nullable', 'string', 'max:100'],
            'emergency_contact_number' => ['nullable', 'string', 'max:30'],
            'status' => ['present', Rule::in(['pending', 'active', 'inactive'])],
        ], $this->volunteerMessages());

        $previousStatus = $volunteer->status;

        $volunteer->update([
            'motivation' => VolunteerPresenter::blankToNull($validated['motivation'] ?? null),
            'skills' => VolunteerPresenter::blankToNull($validated['skills'] ?? null),
            'availability' => VolunteerPresenter::blankToNull($validated['availability'] ?? null),
            'emergency_contact_name' => VolunteerPresenter::blankToNull($validated['emergency_contact_name'] ?? null),
            'emergency_contact_number' => VolunteerPresenter::blankToNull($validated['emergency_contact_number'] ?? null),
            'status' => $validated['status'],
        ]);

        $this->applyApprovalStamp($volunteer, $previousStatus, $validated['status'], $req);

        return response()->json([
            'message' => 'Volunteer updated successfully.',
            'success' => true,
            'data' => $volunteer->fresh(),
        ]);
    }

    public function setStatus(Request $req, $id): JsonResponse
    {
        $validated = $req->validate([
            'status' => ['present', Rule::in(['pending', 'active', 'inactive'])],
        ], $this->volunteerMessages());

        $volunteer = Volunteer::findOrFail($id);
        $previousStatus = $volunteer->status;
        $volunteer->status = $validated['status'];

        $this->applyApprovalStamp($volunteer, $previousStatus, $validated['status'], $req);

        return response()->json([
            'message' => "Volunteer set to {$volunteer->status}.",
            'success' => true,
            'data' => $volunteer->fresh(),
        ]);
    }

    /**
     * Assign a volunteer to an activity. Re-assigning updates the existing row so a
     * volunteer cannot be double-booked onto the same activity.
     */
    public function storeAssignment(Request $req, $id): JsonResponse
    {
        $volunteer = Volunteer::findOrFail($id);

        $validated = $req->validate([
            'activity_id' => ['required', 'integer', 'exists:activities,id'],
            'role' => ['nullable', 'string', 'max:100'],
            'status' => ['present', Rule::in(['assigned', 'completed', 'cancelled'])],
        ], $this->volunteerMessages());

        $existing = $volunteer->assignments()->where('activity_id', $validated['activity_id'])->first();

        if ($existing) {
            $volunteer->assignments()->updateOrCreate(
                ['activity_id' => $validated['activity_id']],
                [
                    'role' => VolunteerPresenter::blankToNull($validated['role'] ?? null),
                    'status' => $validated['status'],
                    'assigned_by' => $req->user()?->id,
                ],
            );
        } else {
            $volunteer->assignments()->create([
                'activity_id' => $validated['activity_id'],
                'role' => VolunteerPresenter::blankToNull($validated['role'] ?? null),
                'status' => $validated['status'],
                'assigned_by' => $req->user()?->id,
                'assigned_at' => now(),
            ]);
        }

        $assignment = $volunteer->assignments()
            ->with(['activity.category', 'attendance'])
            ->where('activity_id', $validated['activity_id'])
            ->firstOrFail();

        return response()->json([
            'message' => $existing ? 'Assignment updated.' : 'Volunteer assigned to the activity.',
            'success' => true,
            'data' => VolunteerPresenter::assignment($assignment),
        ], $existing ? 200 : 201);
    }

    public function destroyAssignment(Request $req, $id, $assignmentId): JsonResponse
    {
        $assignment = VolunteerActivity::where('volunteer_id', $id)->findOrFail($assignmentId);

        // Attendance cascades here, so refuse rather than silently erasing service hours.
        if ($assignment->attendance()->exists()) {
            return response()->json([
                'message' => 'Attendance has been recorded for this assignment. Remove the attendance record first.',
                'success' => false,
            ], 422);
        }

        $assignment->delete();

        return response()->json([
            'message' => 'Assignment removed.',
            'success' => true,
        ]);
    }

    /**
     * Log or edit attendance for an assignment. The unique index on
     * volunteer_activity_id means re-logging edits the record rather than duplicating it.
     */
    public function storeAttendance(Request $req, $id): JsonResponse
    {
        $volunteer = Volunteer::findOrFail($id);

        $validated = $req->validate([
            'volunteer_activity_id' => ['required', 'integer', 'exists:volunteer_activities,id'],
            'time_in' => ['nullable', 'date'],
            'time_out' => ['nullable', 'date', 'after_or_equal:time_in'],
            'hours_rendered' => ['nullable', 'numeric', 'min:0', 'max:24', 'decimal:0,2'],
            'method' => ['present', Rule::in(['manual', 'qr'])],
            'remarks' => ['nullable', 'string', 'max:255'],
        ], $this->volunteerMessages());

        // Scoping by volunteer_id stops a staff member logging hours against someone else's assignment.
        $assignment = VolunteerActivity::where('volunteer_id', $volunteer->id)
            ->findOrFail($validated['volunteer_activity_id']);

        $timeIn = VolunteerPresenter::blankToNull($validated['time_in'] ?? null);
        $timeOut = VolunteerPresenter::blankToNull($validated['time_out'] ?? null);

        // Derive credited hours from the times when staff did not type an amount.
        $hours = $validated['hours_rendered'] ?? null;

        if ($hours === null && $timeIn && $timeOut) {
            $hours = round(Carbon::parse($timeIn)->diffInMinutes(Carbon::parse($timeOut)) / 60, 2);
        }

        $record = $assignment->attendance()->updateOrCreate(
            [],
            [
                'time_in' => $timeIn,
                'time_out' => $timeOut,
                'hours_rendered' => $hours,
                'method' => $validated['method'],
                'recorded_by' => $req->user()?->id,
                'remarks' => VolunteerPresenter::blankToNull($validated['remarks'] ?? null),
            ],
        );

        // Completing the assignment is the natural side effect of logging hours.
        if ($assignment->status === 'assigned' && $record->hours_rendered !== null) {
            $assignment->update(['status' => 'completed']);
        }

        return response()->json([
            'message' => 'Attendance recorded.',
            'success' => true,
            'data' => VolunteerPresenter::assignment($assignment->load(['activity.category', 'attendance'])),
        ], 201);
    }

    /**
     * Stamp the reviewer the first time a volunteer becomes active. The previous status
     * is passed in because the caller has usually already written the new one.
     */
    private function applyApprovalStamp(Volunteer $volunteer, string $previousStatus, string $nextStatus, Request $req): void
    {
        if ($nextStatus === 'active' && $previousStatus !== 'active' && $volunteer->approved_by === null) {
            $volunteer->approved_by = $req->user()?->id;
            $volunteer->approved_at = now();
            $volunteer->save();
        }
    }

    /**
     * Validation messages that read naturally in the admin and staff UIs.
     */
    private function volunteerMessages(): array
    {
        return [
            'email.required' => 'Enter the youth email address.',
            'email.exists' => 'No youth account uses that email address.',
            'status.in' => 'Choose a valid volunteer status.',
            'activity_id.required' => 'Choose an activity to assign.',
            'activity_id.exists' => 'That activity no longer exists.',
            'time_out.after_or_equal' => 'The time out must be at or after the time in.',
            'hours_rendered.max' => 'A single session cannot exceed 24 hours.',
            'hours_rendered.decimal' => 'Enter the hours with at most 2 decimal places.',
            'method.in' => 'Choose how the attendance was recorded.',
        ];
    }
}
