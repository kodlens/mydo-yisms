<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\CorrectActivityAttendanceRequest;
use App\Http\Requests\RecordActivityAttendanceRequest;
use App\Models\Activity;
use App\Services\ActivityAttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffActivityAttendanceController extends Controller
{
    public function __construct(
        protected ActivityAttendanceService $attendanceService
    ) {}

    /**
     * Dedicated attendance interface for an activity.
     */
    public function index(int $id): Response
    {
        $activity = Activity::with('category:id,name')->findOrFail($id);
        $summary = $this->attendanceService->getSummary($activity);

        return Inertia::render('staff/events-activities/staff-activity-attendance-page', [
            'activity' => [
                'id' => $activity->id,
                'title' => $activity->title,
                'slug' => $activity->slug,
                'status' => $activity->status,
                'starts_at' => optional($activity->starts_at)->toIso8601String(),
                'ends_at' => optional($activity->ends_at)->toIso8601String(),
                'venue_name' => $activity->venue_name,
                'venue_address' => $activity->venue_address,
                'capacity' => $activity->capacity,
                'category_name' => $activity->category?->name,
            ],
            'initialSummary' => $summary,
        ]);
    }

    /**
     * Real-time attendance data, summary, and attendee list.
     */
    public function data(Request $request, int $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        $search = $request->query('search');
        $method = $request->query('method');
        $perPage = (int) $request->query('per_page', 20);

        $summary = $this->attendanceService->getSummary($activity);
        $attendances = $this->attendanceService->getAttendanceList($activity, $search, $method, $perPage);

        // Format rows for the client
        $items = collect($attendances->items())->map(function ($record) {
            $youth = $record->youthProfile;

            return [
                'id' => $record->id,
                'youth_profile_id' => $record->youth_profile_id,
                'reference_code' => $youth?->reference_code,
                'student_id' => $youth?->student_id,
                'full_name' => trim(implode(' ', array_filter([$youth?->fname, $youth?->mname, $youth?->lname, $youth?->suffix]))) ?: 'Unknown youth',
                'email' => $youth?->email,
                'mobile_number' => $youth?->mobile_number,
                'barangay' => $youth?->brgyCode,
                'method' => $record->method,
                'attended_at' => optional($record->attended_at)->toIso8601String(),
                'remarks' => $record->remarks,
                'recorded_by_name' => trim("{$record->recordedBy?->fname} {$record->recordedBy?->lname}") ?: ($record->recordedBy?->username ?? 'Staff'),
            ];
        });

        return response()->json([
            'success' => true,
            'summary' => $summary,
            'attendances' => [
                'data' => $items,
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'total' => $attendances->total(),
                'per_page' => $attendances->perPage(),
            ],
        ]);
    }

    /**
     * Unified endpoint to record attendance via QR scan or manual reference code.
     */
    public function record(RecordActivityAttendanceRequest $request, int $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        $attendance = $this->attendanceService->recordAttendance(
            $activity,
            $request->validated('reference_code'),
            $request->validated('method'),
            $request->user(),
            $request->validated('remarks')
        );

        $youth = $attendance->youthProfile;
        $fullName = trim(implode(' ', array_filter([$youth?->fname, $youth?->mname, $youth?->lname, $youth?->suffix]))) ?: 'Youth Member';

        return response()->json([
            'success' => true,
            'message' => "Attendance recorded for {$fullName}.",
            'data' => [
                'id' => $attendance->id,
                'youth_profile_id' => $youth?->id,
                'reference_code' => $youth?->reference_code,
                'student_id' => $youth?->student_id,
                'full_name' => $fullName,
                'email' => $youth?->email,
                'barangay' => $youth?->brgyCode,
                'method' => $attendance->method,
                'attended_at' => optional($attendance->attended_at)->toIso8601String(),
            ],
            'summary' => $this->attendanceService->getSummary($activity),
        ], 201);
    }

    /**
     * Remove an attendance record with administrative audit logging.
     */
    public function destroy(CorrectActivityAttendanceRequest $request, int $id, int $attendanceId): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        $this->attendanceService->removeAttendanceWithAudit(
            $activity,
            $attendanceId,
            $request->user(),
            $request->validated('reason')
        );

        return response()->json([
            'success' => true,
            'message' => 'Attendance record removed successfully.',
            'summary' => $this->attendanceService->getSummary($activity),
        ]);
    }
}
