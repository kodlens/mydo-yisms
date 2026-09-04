<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class YouthProfile extends Model
{
    protected $fillable = [
        'student_id',
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
        'is_active',
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

    public function youth(): BelongsTo
    {
        return $this->belongsTo(Youth::class, 'student_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
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
}
