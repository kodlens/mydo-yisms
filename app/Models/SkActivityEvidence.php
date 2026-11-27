<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SkActivityEvidence extends Model
{
    protected $table = 'sk_activity_evidences';

    protected $fillable = [
        'activity_id',
        'youth_profile_id',
        'user_id',
        'description',
        'photos',
    ];

    protected function casts(): array
    {
        return [
            'photos' => 'array',
        ];
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function skOfficial(): BelongsTo
    {
        return $this->belongsTo(YouthProfile::class, 'youth_profile_id');
    }

    public function skUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
