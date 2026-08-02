<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    protected $table = 'barangays';

    protected $fillable = [
        'citymunCode',
        'brgyDesc',
        'brgyCode',
    ];
    public function city()
    {
        return $this->belongsTo(City::class, 'citymunCode', 'citymunCode');
    }
}
