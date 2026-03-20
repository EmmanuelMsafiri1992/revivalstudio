<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'outlet_id',
        'furniture_type_id',
        'name',
        'description',
        'price',
        'original_price',
        'condition',
        'brand',
        'material',
        'dimensions',
        'color',
        'quantity',
        'images',
        'status',
        'featured',
        'comparison_retailer',
        'comparison_product_name',
        'comparison_price',
        'comparison_url',
        'co2_new',
        'co2_refurbished',
        'co2_saved',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'comparison_price' => 'decimal:2',
        'co2_new' => 'decimal:2',
        'co2_refurbished' => 'decimal:2',
        'co2_saved' => 'decimal:2',
        'images' => 'array',
        'featured' => 'boolean',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function furnitureType()
    {
        return $this->belongsTo(FurnitureType::class);
    }

    public function getDiscountPercentageAttribute()
    {
        if ($this->original_price && $this->original_price > $this->price) {
            return round((($this->original_price - $this->price) / $this->original_price) * 100);
        }
        return 0;
    }

    public function getConditionLabelAttribute()
    {
        return match($this->condition) {
            'excellent' => 'Excellent - Like New',
            'good' => 'Good',
            'fair' => 'Fair',
            'poor' => 'Needs Repair',
            default => ucfirst($this->condition),
        };
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }
}
