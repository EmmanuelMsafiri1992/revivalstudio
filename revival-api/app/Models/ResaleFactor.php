<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResaleFactor extends Model
{
    protected $fillable = ['type', 'key', 'name', 'factor', 'sort_order', 'active'];

    protected $casts = [
        'factor' => 'float',
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($q)
    {
        return $q->where('active', true);
    }

    public function scopeOfType($q, $type)
    {
        return $q->where('type', $type);
    }
}
