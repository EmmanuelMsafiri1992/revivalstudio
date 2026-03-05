<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FurnitureType extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'icon',
        'base_repair_cost',
        'base_value',
        'sort_order',
        'active',
    ];

    protected $casts = [
        'base_repair_cost' => 'decimal:2',
        'base_value' => 'decimal:2',
        'active' => 'boolean',
    ];

    public function repairRequests(): HasMany
    {
        return $this->hasMany(RepairRequest::class);
    }

    public function sellRequests(): HasMany
    {
        return $this->hasMany(SellRequest::class);
    }

    public function catalogItems(): HasMany
    {
        return $this->hasMany(FurnitureCatalog::class);
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
