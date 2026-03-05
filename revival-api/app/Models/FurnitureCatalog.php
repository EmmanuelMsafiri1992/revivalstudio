<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FurnitureCatalog extends Model
{
    protected $table = 'furniture_catalog';

    protected $fillable = [
        'furniture_type_id',
        'name',
        'description',
        'price',
        'style',
        'image',
        'available',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'available' => 'boolean',
    ];

    public function furnitureType(): BelongsTo
    {
        return $this->belongsTo(FurnitureType::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('available', true);
    }

    public function scopeByStyle($query, $style)
    {
        return $query->where('style', $style);
    }
}
