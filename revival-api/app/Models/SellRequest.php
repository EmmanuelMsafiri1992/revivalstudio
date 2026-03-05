<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellRequest extends Model
{
    protected $fillable = [
        'furniture_type_id',
        'age',
        'condition',
        'brand_category',
        'original_price',
        'customer_name',
        'email',
        'phone',
        'address',
        'photos',
        'estimated_min',
        'estimated_max',
        'status',
        'notes',
        'outlet_id',
    ];

    protected $casts = [
        'photos' => 'array',
        'original_price' => 'decimal:2',
        'estimated_min' => 'decimal:2',
        'estimated_max' => 'decimal:2',
    ];

    public function furnitureType(): BelongsTo
    {
        return $this->belongsTo(FurnitureType::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }
}
