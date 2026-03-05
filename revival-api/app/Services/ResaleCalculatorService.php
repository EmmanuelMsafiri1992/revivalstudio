<?php

namespace App\Services;

use App\Models\FurnitureType;

class ResaleCalculatorService
{
    protected array $ageFactors = [
        'new' => ['name' => 'Like New (< 1 year)', 'factor' => 0.70],
        '1-3' => ['name' => '1-3 Years', 'factor' => 0.50],
        '3-5' => ['name' => '3-5 Years', 'factor' => 0.35],
        '5-10' => ['name' => '5-10 Years', 'factor' => 0.20],
        '10+' => ['name' => '10+ Years', 'factor' => 0.10],
        'antique' => ['name' => 'Antique (50+ years)', 'factor' => 0.80],
    ];

    protected array $conditionFactors = [
        'excellent' => ['name' => 'Excellent', 'factor' => 1.0],
        'good' => ['name' => 'Good', 'factor' => 0.75],
        'fair' => ['name' => 'Fair', 'factor' => 0.50],
        'poor' => ['name' => 'Poor', 'factor' => 0.25],
    ];

    protected array $brandFactors = [
        'designer' => ['name' => 'Designer/Luxury Brand', 'factor' => 1.5],
        'premium' => ['name' => 'Premium Brand', 'factor' => 1.25],
        'standard' => ['name' => 'Standard Brand', 'factor' => 1.0],
        'budget' => ['name' => 'Budget Brand', 'factor' => 0.8],
        'unknown' => ['name' => 'Unknown/Unbranded', 'factor' => 0.7],
    ];

    public function calculate(
        int $furnitureTypeId,
        string $age,
        string $condition,
        string $brandCategory = 'standard',
        ?float $originalPrice = null
    ): array {
        $furnitureType = FurnitureType::findOrFail($furnitureTypeId);

        // Use original price if provided, otherwise use base value
        $baseValue = $originalPrice && $originalPrice > 0
            ? $originalPrice
            : (float) $furnitureType->base_value;

        // Get factors
        $ageFactor = $this->ageFactors[$age] ?? $this->ageFactors['3-5'];
        $conditionFactor = $this->conditionFactors[$condition] ?? $this->conditionFactors['good'];
        $brandFactor = $this->brandFactors[$brandCategory] ?? $this->brandFactors['standard'];

        // Calculate resale value
        $calculatedValue = $baseValue * $ageFactor['factor'] * $conditionFactor['factor'] * $brandFactor['factor'];

        // Create range (±15%)
        $minValue = round($calculatedValue * 0.85, 2);
        $maxValue = round($calculatedValue * 1.15, 2);

        return [
            'furniture_type' => [
                'id' => $furnitureType->id,
                'name' => $furnitureType->name,
                'base_value' => $furnitureType->base_value,
            ],
            'age' => [
                'key' => $age,
                'name' => $ageFactor['name'],
                'factor' => $ageFactor['factor'],
            ],
            'condition' => [
                'key' => $condition,
                'name' => $conditionFactor['name'],
                'factor' => $conditionFactor['factor'],
            ],
            'brand' => [
                'key' => $brandCategory,
                'name' => $brandFactor['name'],
                'factor' => $brandFactor['factor'],
            ],
            'original_price' => $originalPrice,
            'base_value_used' => $baseValue,
            'estimated_min' => $minValue,
            'estimated_max' => $maxValue,
            'currency' => 'GBP',
        ];
    }

    public function getAgeOptions(): array
    {
        return $this->ageFactors;
    }

    public function getConditionOptions(): array
    {
        return $this->conditionFactors;
    }

    public function getBrandOptions(): array
    {
        return $this->brandFactors;
    }
}
