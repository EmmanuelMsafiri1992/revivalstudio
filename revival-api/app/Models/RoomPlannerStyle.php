<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomPlannerStyle extends Model
{
    protected $fillable = ['key', 'name', 'price_multiplier', 'sort_order', 'active'];

    protected $casts = [
        'price_multiplier' => 'float',
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($q)
    {
        return $q->where('active', true);
    }
}
