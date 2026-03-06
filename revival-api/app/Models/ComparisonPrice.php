<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComparisonPrice extends Model
{
    protected $fillable = [
        'furniture_type_id',
        'retailer_name',
        'product_name',
        'retail_price',
        'product_url',
        'image',
        'is_active',
    ];

    protected $casts = [
        'retail_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function furnitureType(): BelongsTo
    {
        return $this->belongsTo(FurnitureType::class);
    }
}
