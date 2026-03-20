<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PremiumCode extends Model
{
    protected $fillable = [
        'code',
        'description',
        'is_active',
        'max_uses',
        'used_count',
        'expires_at',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'max_uses'   => 'integer',
        'used_count' => 'integer',
        'expires_at' => 'datetime',
    ];

    public function isValid(): bool
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) return false;
        return true;
    }
}
