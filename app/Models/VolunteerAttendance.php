<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VolunteerAttendance extends Model
{
    protected $table = 'volunteer_attendance';

    protected $fillable = [
        'volunteer_activity_id',
        'time_in',
        'time_out',
        'hours_rendered',
        'method',
        'recorded_by',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'time_in' => 'datetime',
            'time_out' => 'datetime',
            'hours_rendered' => 'decimal:2',
        ];
    }

    public function volunteerActivity(): BelongsTo
    {
        return $this->belongsTo(VolunteerActivity::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
