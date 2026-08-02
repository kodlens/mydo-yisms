<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'username',
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
        'guardian_name',
        'guardian_contact_number',
        'monthly_family_income',
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
            'monthly_family_income' => 'decimal:2',
            'email_verified_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
        ];
    }
}
