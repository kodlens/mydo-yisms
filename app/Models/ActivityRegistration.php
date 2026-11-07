<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ActivityRegistration extends Model
{
    protected $fillable = [
        'activity_id',
        'youth_profile_id',
        'status',
        'registered_at',
        'cancelled_at',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function youthProfile(): BelongsTo
    {
        return $this->belongsTo(YouthProfile::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function attendance(): HasOne
    {
        return $this->hasOne(ActivityAttendance::class, 'activity_registration_id');
    }

    /**
     * Only pending and approved rows hold a slot. Cancelled and rejected rows are
     * history, so they must never count toward capacity.
     */
    public function scopeReservingSlot($query)
    {
        return $query->whereIn('status', ['pending', 'approved']);
    }
}
