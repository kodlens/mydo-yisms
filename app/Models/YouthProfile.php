<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;


class YouthProfile extends Authenticatable
{
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $fillable = [
        'student_id',
        'reference_code',
        'email',
        'lname',
        'fname',
        'mname',
        'suffix',
        'birth_date',
        'sex',
        'civil_status',
        'mobile_number',
        'provCode',
        'citymunCode',
        'brgyCode',
        'street_address',
        'zip_code',
        'school_name',
        'program',
        'year',
        'previous_semester_gwa',
        'guardian_name',
        'guardian_contact_number',
        'monthly_family_income',
        'password',
        'email_verified_at',
        'is_active',
        'is_graduated',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'year' => 'integer',
            'previous_semester_gwa' => 'decimal:2',
            'monthly_family_income' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }


    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'provCode', 'provCode');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'citymunCode', 'citymunCode');
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class, 'brgyCode', 'brgyCode');
    }

    public function scholarshipApplications(): HasMany
    {
        return $this->hasMany(ScholarshipApplication::class);
    }

    public function volunteerRecord(): HasOne
    {
        return $this->hasOne(Volunteer::class);
    }

    public function activityRegistrations(): HasMany
    {
        return $this->hasMany(ActivityRegistration::class);
    }

    public function activityAttendances(): HasMany
    {
        return $this->hasMany(ActivityAttendance::class);
    }

    public function cashIncentiveBeneficiaries(): HasMany
    {
        return $this->hasMany(CashIncentiveBeneficiary::class, 'youth_profile_id');
    }

    public function dashboardRoute(): string
    {
        return 'youth.youth-dashboard.index';
    }

    protected static function booted(): void
    {
        static::creating(function (YouthProfile $profile) {
            if (empty($profile->reference_code)) {
                $profile->reference_code = static::generateUniqueReferenceCode();
            }
        });
    }

    public static function generateUniqueReferenceCode(): string
    {
        do {
            $code = 'YD-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4));
        } while (static::where('reference_code', $code)->exists());

        return $code;
    }
}
