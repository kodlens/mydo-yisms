<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityAttendance;
use App\Models\ActivityLog;
use App\Models\ActivityRegistration;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ActivityAttendanceService
{
    /**
     * Record attendance for a registered youth member using their reference code.
     *
     * @param Activity $activity
     * @param string $referenceCode
     * @param string $method 'qr' or 'manual'
     * @param User $recordedBy
     * @param string|null $remarks
     * @return ActivityAttendance
     * @throws ValidationException
     */
    public function recordAttendance(
        Activity $activity,
        string $referenceCode,
        string $method,
        User $recordedBy,
        ?string $remarks = null
    ): ActivityAttendance {
        $cleanCode = strtoupper(trim($referenceCode));

        if ($cleanCode === '') {
            throw ValidationException::withMessages([
                'reference_code' => 'Please enter or scan a valid youth reference code.',
            ]);
        }

        return DB::transaction(function () use ($activity, $cleanCode, $method, $recordedBy, $remarks) {
            // Lock activity row for read/write integrity
            $lockedActivity = Activity::whereKey($activity->id)->lockForUpdate()->firstOrFail();

            // Validate activity status
            if ($lockedActivity->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'activity' => 'Cannot record attendance: this activity has been cancelled.',
                ]);
            }

            if ($lockedActivity->status === 'draft') {
                throw ValidationException::withMessages([
                    'activity' => 'Cannot record attendance: this activity is still in draft.',
                ]);
            }

            // Find youth profile by reference code with row locking
            $youthProfile = YouthProfile::where('reference_code', $cleanCode)
                ->lockForUpdate()
                ->first();

            if (! $youthProfile) {
                // Secondary fallback: check student_id if staff entered it manually
                $youthProfile = YouthProfile::where('student_id', $cleanCode)
                    ->lockForUpdate()
                    ->first();
            }

            if (! $youthProfile) {
                throw ValidationException::withMessages([
                    'reference_code' => "No youth profile found matching reference code \"{$cleanCode}\".",
                ]);
            }

            if (! $youthProfile->is_active) {
                throw ValidationException::withMessages([
                    'reference_code' => "The profile for {$youthProfile->fname} {$youthProfile->lname} is currently deactivated.",
                ]);
            }

            // Verify registration for this activity
            $registration = ActivityRegistration::where('activity_id', $lockedActivity->id)
                ->where('youth_profile_id', $youthProfile->id)
                ->lockForUpdate()
                ->first();

            if (! $registration) {
                throw ValidationException::withMessages([
                    'reference_code' => "{$youthProfile->fname} {$youthProfile->lname} is not registered for this activity.",
                ]);
            }

            if ($registration->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'reference_code' => "Participation for {$youthProfile->fname} {$youthProfile->lname} was cancelled.",
                ]);
            }

            if ($registration->status === 'rejected') {
                throw ValidationException::withMessages([
                    'reference_code' => "Registration for {$youthProfile->fname} {$youthProfile->lname} was not accepted by staff.",
                ]);
            }

            if ($registration->status === 'pending') {
                throw ValidationException::withMessages([
                    'reference_code' => "Registration for {$youthProfile->fname} {$youthProfile->lname} is still pending approval. Please approve the sign-up before checking in.",
                ]);
            }

            if ($registration->status !== 'approved') {
                throw ValidationException::withMessages([
                    'reference_code' => "Registration status ({$registration->status}) does not permit attendance check-in.",
                ]);
            }

            // Check for existing duplicate attendance record
            $existingAttendance = ActivityAttendance::where('activity_id', $lockedActivity->id)
                ->where('youth_profile_id', $youthProfile->id)
                ->lockForUpdate()
                ->first();

            if ($existingAttendance) {
                $attendedTime = optional($existingAttendance->attended_at)->timezone('Asia/Manila')->format('h:i A') ?? 'earlier';
                $scanMethod = strtoupper($existingAttendance->method);

                throw ValidationException::withMessages([
                    'duplicate' => "Attendance already recorded for {$youthProfile->fname} {$youthProfile->lname} at {$attendedTime} (via {$scanMethod}).",
                ]);
            }

            // Create attendance record
            $attendance = ActivityAttendance::create([
                'activity_id' => $lockedActivity->id,
                'youth_profile_id' => $youthProfile->id,
                'activity_registration_id' => $registration->id,
                'recorded_by' => $recordedBy->id,
                'method' => in_array($method, ['qr', 'manual'], true) ? $method : 'manual',
                'attended_at' => now('UTC'),
                'remarks' => trim((string) $remarks) ?: null,
            ]);

            return $attendance->load(['youthProfile', 'recordedBy', 'registration']);
        });
    }

    /**
     * Get attendance summary statistics for an activity.
     */
    public function getSummary(Activity $activity): array
    {
        $approvedCount = $activity->registrations()
            ->where('status', 'approved')
            ->count();

        $attendedCount = $activity->attendances()->count();

        $qrCount = $activity->attendances()->where('method', 'qr')->count();
        $manualCount = $activity->attendances()->where('method', 'manual')->count();

        $attendanceRate = $approvedCount > 0
            ? round(($attendedCount / $approvedCount) * 100, 1)
            : 0;

        return [
            'approved_registrations_count' => $approvedCount,
            'attended_count' => $attendedCount,
            'unattended_count' => max(0, $approvedCount - $attendedCount),
            'qr_count' => $qrCount,
            'manual_count' => $manualCount,
            'attendance_rate' => $attendanceRate,
            'capacity' => $activity->capacity,
        ];
    }

    /**
     * Get paginated/filtered list of attendances for an activity.
     */
    public function getAttendanceList(Activity $activity, ?string $search = null, ?string $method = null, int $perPage = 20)
    {
        $query = $activity->attendances()
            ->with(['youthProfile', 'recordedBy'])
            ->orderByDesc('attended_at');

        if ($method && in_array($method, ['qr', 'manual'], true)) {
            $query->where('method', $method);
        }

        if ($search !== null && trim($search) !== '') {
            $term = trim($search);
            $query->whereHas('youthProfile', function (Builder $q) use ($term) {
                $q->where('fname', 'like', "%{$term}%")
                    ->orWhere('lname', 'like', "%{$term}%")
                    ->orWhere('reference_code', 'like', "%{$term}%")
                    ->orWhere('student_id', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Remove an attendance record with explicit reason and audit log trail.
     */
    public function removeAttendanceWithAudit(
        Activity $activity,
        int $attendanceId,
        User $actor,
        string $reason
    ): void {
        DB::transaction(function () use ($activity, $attendanceId, $actor, $reason) {
            $attendance = ActivityAttendance::where('activity_id', $activity->id)
                ->whereKey($attendanceId)
                ->with('youthProfile')
                ->lockForUpdate()
                ->firstOrFail();

            $youth = $attendance->youthProfile;
            $oldData = $attendance->toArray();

            // Create audit log entry
            ActivityLog::create([
                'user_id' => $actor->id,
                'actor_name' => trim("{$actor->fname} {$actor->lname}") ?: $actor->username,
                'actor_role' => $actor->role,
                'action' => 'activity_attendance.removed',
                'description' => "Removed attendance record for {$youth?->fname} {$youth?->lname} on activity \"{$activity->title}\". Reason: {$reason}",
                'subject_type' => ActivityAttendance::class,
                'subject_id' => $attendance->id,
                'old_values' => $oldData,
                'new_values' => null,
                'metadata' => [
                    'activity_id' => $activity->id,
                    'youth_profile_id' => $youth?->id,
                    'reference_code' => $youth?->reference_code,
                    'reason' => $reason,
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
            ]);

            $attendance->delete();
        });
    }
}
