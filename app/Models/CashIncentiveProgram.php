<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashIncentiveProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'description',
        'funding_year',
        'amount_per_beneficiary',
        'allocated_budget',
        'max_beneficiaries',
        'selection_start_date',
        'selection_end_date',
        'release_start_date',
        'release_end_date',
        'status',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'funding_year' => 'integer',
            'amount_per_beneficiary' => 'decimal:2',
            'allocated_budget' => 'decimal:2',
            'max_beneficiaries' => 'integer',
            'selection_start_date' => 'date',
            'selection_end_date' => 'date',
            'release_start_date' => 'date',
            'release_end_date' => 'date',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function beneficiaries(): HasMany
    {
        return $this->hasMany(CashIncentiveBeneficiary::class, 'program_id');
    }

    public function approvedBeneficiaries(): HasMany
    {
        return $this->hasMany(CashIncentiveBeneficiary::class, 'program_id')->where('status', 'approved');
    }

    public function releases(): HasMany
    {
        return $this->hasMany(CashIncentiveRelease::class, 'program_id');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(CashIncentiveStatusHistory::class, 'program_id');
    }
}
