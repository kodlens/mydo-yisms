<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activity extends Model
{
    protected $fillable = [
        'activity_category_id',
        'created_by',
        'title',
        'slug',
        'summary',
        'description',
        'cover_image_path',
        'venue_name',
        'venue_address',
        'starts_at',
        'ends_at',
        'registration_opens_at',
        'registration_closes_at',
        'capacity',
        'requires_registration',
        'requires_approval',
        'eligibility_notes',
        'requirements',
        'status',
        'published_at',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'immutable_datetime',
            'ends_at' => 'immutable_datetime',
            'published_at' => 'immutable_datetime',
            'registration_opens_at' => 'immutable_datetime',
            'registration_closes_at' => 'immutable_datetime',
            'capacity' => 'integer',
            'requires_registration' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ActivityCategory::class, 'activity_category_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(ActivityRegistration::class);
    }

    public function volunteerAssignments(): HasMany
    {
        return $this->hasMany(VolunteerActivity::class);
    }
}
