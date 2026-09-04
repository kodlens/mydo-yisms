<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScholarshipDocument extends Model
{
    protected $fillable = [
        'scholarship_application_id',
        'type',
        'path',
        'status',
    ];

    public function scholarshipApplication(): BelongsTo
    {
        return $this->belongsTo(ScholarshipApplication::class);
    }
}
