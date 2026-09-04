<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Authenticatable
{
    protected $fillable = [
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
        'coe_path',
        'cog_path',
        'cedula_path',
        'school_id_path',
        'psa_path',
        'email',
        'password',
        'role',
        'registration_status',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'year' => 'integer',
            'previous_semester_gwa' => 'decimal:2',
            'monthly_family_income' => 'decimal:2',
            'email_verified_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
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
}
