<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryItem extends Model
{
    protected $fillable = [
        'outlet_id',
        'furniture_type_id',
        'item_name',
        'description',
        'customer_name',
        'status',
        'repair_cost',
        'sale_price',
        'photos',
        'notes',
    ];

    protected $casts = [
        'photos' => 'array',
        'repair_cost' => 'decimal:2',
        'sale_price' => 'decimal:2',
    ];

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function furnitureType(): BelongsTo
    {
        return $this->belongsTo(FurnitureType::class);
    }
}
