<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    protected $table = 'provinces';

    protected $fillable = [
        'provCode',
        'provDesc',
        'active'
    ];
    public function cities()
    {
        return $this->hasMany(City::class, 'provCode', 'provCode');
    }
}
