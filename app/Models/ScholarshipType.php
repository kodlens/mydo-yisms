<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScholarshipType extends Model
{


    protected $fillable = [
        'scholarship',
        'target_beneficiary',
        'benefit',
        'amount',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}



