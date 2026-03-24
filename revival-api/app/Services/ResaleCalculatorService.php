<?php

namespace App\Services;

use App\Models\FurnitureType;
use App\Models\ResaleFactor;

class ResaleCalculatorService
{
    // Fallback arrays used only when DB has no records
    private array $fallbackAgeFactors = [
        'new'     => ['name' => 'Like New (< 1 year)',  'factor' => 0.70],
        '1-3'     => ['name' => '1-3 Years',            'factor' => 0.50],
        '3-5'     => ['name' => '3-5 Years',            'factor' => 0.35],
        '5-10'    => ['name' => '5-10 Years',           'factor' => 0.20],
        '10+'     => ['name' => '10+ Years',            'factor' => 0.10],
        'antique' => ['name' => 'Antique (50+ years)',  'factor' => 0.80],
    ];

    private array $fallbackConditionFactors = [
        'excellent' => ['name' => 'Excellent', 'factor' => 1.0],
        'good'      => ['name' => 'Good',      'factor' => 0.75],
        'fair'      => ['name' => 'Fair',      'factor' => 0.50],
        'poor'      => ['name' => 'Poor',      'factor' => 0.25],
    ];

    private array $fallbackBrandFactors = [
        'designer' => ['name' => 'Designer/Luxury Brand', 'factor' => 1.5],
        'premium'  => ['name' => 'Premium Brand',         'factor' => 1.25],
        'standard' => ['name' => 'Standard Brand',        'factor' => 1.0],
        'budget'   => ['name' => 'Budget Brand',          'factor' => 0.8],
        'unknown'  => ['name' => 'Unknown/Unbranded',     'factor' => 0.7],
    ];

    private function getFactorsFromDb(string $type): array
    {
        $rows = ResaleFactor::active()->ofType($type)->orderBy('sort_order')->get();

        if ($rows->isEmpty()) {
            return [];
        }

        $result = [];
        foreach ($rows as $row) {
            $result[$row->key] = ['name' => $row->name, 'factor' => $row->factor];
        }

        return $result;
    }

    private function getAgeFactors(): array
    {
        $db = $this->getFactorsFromDb('age');
        return $db ?: $this->fallbackAgeFactors;
    }

    private function getConditionFactors(): array
    {
        $db = $this->getFactorsFromDb('condition');
        return $db ?: $this->fallbackConditionFactors;
    }

    private function getBrandFactors(): array
    {
        $db = $this->getFactorsFromDb('brand');
        return $db ?: $this->fallbackBrandFactors;
    }

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

        $ageFactors       = $this->getAgeFactors();
        $conditionFactors = $this->getConditionFactors();
        $brandFactors     = $this->getBrandFactors();

        // Get factors with fallback defaults
        $ageFactor       = $ageFactors[$age]           ?? $ageFactors['3-5']      ?? ['name' => $age,       'factor' => 0.35];
        $conditionFactor = $conditionFactors[$condition] ?? $conditionFactors['good'] ?? ['name' => $condition, 'factor' => 0.75];
        $brandFactor     = $brandFactors[$brandCategory] ?? $brandFactors['standard'] ?? ['name' => $brandCategory, 'factor' => 1.0];

        // Calculate resale value
        $calculatedValue = $baseValue * $ageFactor['factor'] * $conditionFactor['factor'] * $brandFactor['factor'];

        // Create range (±15%)
        $minValue = round($calculatedValue * 0.85, 2);
        $maxValue = round($calculatedValue * 1.15, 2);

        return [
            'furniture_type' => [
                'id'         => $furnitureType->id,
                'name'       => $furnitureType->name,
                'base_value' => $furnitureType->base_value,
            ],
            'age' => [
                'key'    => $age,
                'name'   => $ageFactor['name'],
                'factor' => $ageFactor['factor'],
            ],
            'condition' => [
                'key'    => $condition,
                'name'   => $conditionFactor['name'],
                'factor' => $conditionFactor['factor'],
            ],
            'brand' => [
                'key'    => $brandCategory,
                'name'   => $brandFactor['name'],
                'factor' => $brandFactor['factor'],
            ],
            'original_price'   => $originalPrice,
            'base_value_used'  => $baseValue,
            'estimated_min'    => $minValue,
            'estimated_max'    => $maxValue,
            'currency'         => 'GBP',
        ];
    }

    public function getAgeOptions(): array
    {
        return $this->getAgeFactors();
    }

    public function getConditionOptions(): array
    {
        return $this->getConditionFactors();
    }

    public function getBrandOptions(): array
    {
        return $this->getBrandFactors();
    }
}
