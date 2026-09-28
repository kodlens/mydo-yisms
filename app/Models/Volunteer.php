<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Volunteer extends Model
{
    protected $fillable = [
        'youth_profile_id',
        'status',
        'motivation',
        'skills',
        'availability',
        'emergency_contact_name',
        'emergency_contact_number',
        'approved_by',
        'approved_at',
        'registered_at',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'registered_at' => 'datetime',
        ];
    }

    public function youthProfile(): BelongsTo
    {
        return $this->belongsTo(YouthProfile::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(VolunteerActivity::class);
    }

    /**
     * Every attendance record across this volunteer's assignments. Lets service hours be
     * summed in one query instead of loading each assignment first.
     */
    public function attendanceRecords(): HasManyThrough
    {
        // volunteer_activities.volunteer_id          -> volunteers.id
        // volunteer_attendance.volunteer_activity_id  -> volunteer_activities.id
        return $this->hasManyThrough(
            VolunteerAttendance::class,
            VolunteerActivity::class,
            'volunteer_id',
            'volunteer_activity_id',
            'id',
            'id',
        );
    }

    /**
     * Adds a `total_hours` attribute summing credited hours across every assignment.
     * A subquery is used because withSum() does not traverse the through relation.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithServiceHours($query)
    {
        // Only introduce the base columns when nothing is selected yet, so this does not
        // discard a selectSub() that withCount() has already added.
        if (empty($query->getQuery()->columns)) {
            $query->select('volunteers.*');
        }

        return $query->selectSub(
            VolunteerAttendance::query()
                ->selectRaw('COALESCE(SUM(volunteer_attendance.hours_rendered), 0)')
                ->join('volunteer_activities', 'volunteer_activities.id', '=', 'volunteer_attendance.volunteer_activity_id')
                ->whereColumn('volunteer_activities.volunteer_id', 'volunteers.id'),
            'total_hours',
        );
    }
}
