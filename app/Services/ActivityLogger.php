<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    /**
     * Record an activity log entry.
     *
     * @param string $action
     * @param string $description
     * @param Model|null $subject
     * @param array<string, mixed>|null $oldValues
     * @param array<string, mixed>|null $newValues
     * @param array<string, mixed>|null $metadata
     * @return ActivityLog
     */
    public static function log(
        string $action,
        string $description,
        ?Model $subject = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?array $metadata = null
    ): ActivityLog {
        $user = Auth::user();

        $actorName = 'System';
        if ($user) {
            $fullName = trim(($user->fname ?? '') . ' ' . ($user->lname ?? ''));
            $actorName = $fullName ?: ($user->name ?? $user->email ?? 'User #' . $user->id);
        }

        return ActivityLog::create([
            'user_id' => $user?->id,
            'actor_name' => $actorName,
            'actor_role' => $user?->role ?? 'admin',
            'action' => $action,
            'description' => $description,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
