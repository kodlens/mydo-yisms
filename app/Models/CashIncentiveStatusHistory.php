<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashIncentiveStatusHistory extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'program_id',
        'beneficiary_id',
        'release_id',
        'from_status',
        'to_status',
        'action_type',
        'reason',
        'metadata',
        'actor_user_id',
        'actor_name',
        'ip_address',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
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

    public function release(): BelongsTo
    {
        return $this->belongsTo(CashIncentiveRelease::class, 'release_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
