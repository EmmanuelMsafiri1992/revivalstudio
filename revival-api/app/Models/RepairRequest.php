<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairRequest extends Model
{
    protected $fillable = [
        'furniture_type_id',
        'material_id',
        'damage_type_ids',
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
        'damage_type_ids' => 'array',
        'photos' => 'array',
        'estimated_min' => 'decimal:2',
        'estimated_max' => 'decimal:2',
    ];

    public function furnitureType(): BelongsTo
    {
        return $this->belongsTo(FurnitureType::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function getDamageTypes()
    {
        if (empty($this->damage_type_ids)) {
            return collect();
        }
        return DamageType::whereIn('id', $this->damage_type_ids)->get();
    }
}
