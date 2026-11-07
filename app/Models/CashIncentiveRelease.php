<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashIncentiveRelease extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'beneficiary_id',
        'amount',
        'status',
        'scheduled_release_date',
        'actual_release_date',
        'acknowledgment_reference',
        'supporting_document_path',
        'released_by_user_id',
        'remarks',
        'cancellation_reason',
        'cancelled_by_user_id',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'scheduled_release_date' => 'date',
            'actual_release_date' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(CashIncentiveProgram::class, 'program_id');
    }

    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(CashIncentiveBeneficiary::class, 'beneficiary_id');
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by_user_id');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by_user_id');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(CashIncentiveStatusHistory::class, 'release_id');
    }
}
