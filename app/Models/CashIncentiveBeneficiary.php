<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CashIncentiveBeneficiary extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'youth_profile_id',
        'status',
        'selected_by_user_id',
        'selected_at',
        'reviewed_by_user_id',
        'reviewed_at',
        'rejection_reason',
        'remarks',
        'historical_brgy_code',
        'historical_brgy_name',
        'historical_school_name',
        'historical_program',
        'historical_year_level',
        'historical_is_graduated',
        'historical_educational_status',
    ];

    protected function casts(): array
    {
        return [
            'selected_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'historical_year_level' => 'integer',
            'historical_is_graduated' => 'boolean',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(CashIncentiveProgram::class, 'program_id');
    }

    public function youthProfile(): BelongsTo
    {
        return $this->belongsTo(YouthProfile::class, 'youth_profile_id');
    }

    public function selectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'selected_by_user_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public function release(): HasOne
    {
        return $this->hasOne(CashIncentiveRelease::class, 'beneficiary_id');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(CashIncentiveStatusHistory::class, 'beneficiary_id');
    }
}
