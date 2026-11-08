<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScholarshipApplication extends Model
{
    protected $fillable = [
        'academic_year_id',
        'youth_profile_id',
        'scholarship_type_id',
        'reference',
        'coe_path',
        'cog_path',
        'cedula_path',
        'school_id_path',
        'psa_path',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function scholarshipType(): BelongsTo
    {
        return $this->belongsTo(ScholarshipType::class);
    }

    public function youthProfile(): BelongsTo
    {
        return $this->belongsTo(YouthProfile::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    protected static function booted(): void
    {
        static::creating(function (ScholarshipApplication $app) {
            if (empty($app->reference)) {
                do {
                    $code = 'SCH-' . date('Y') . '-' . strtoupper(\Illuminate\Support\Str::random(6));
                } while (static::where('reference', $code)->exists());
                $app->reference = $code;
            }
        });
    }


}
