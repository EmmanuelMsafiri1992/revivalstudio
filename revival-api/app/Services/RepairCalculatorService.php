<?php

namespace App\Services;

use App\Models\DamageType;
use App\Models\FurnitureType;
use App\Models\Material;

class RepairCalculatorService
{
    public function calculate(int $furnitureTypeId, int $materialId, array $damageTypeIds = []): array
    {
        $furnitureType = FurnitureType::findOrFail($furnitureTypeId);
        $material = Material::findOrFail($materialId);

        $baseCost = (float) $furnitureType->base_repair_cost;
        $materialMultiplier = (float) $material->repair_multiplier;

        // Calculate damage costs
        $damageCost = 0;
        $damageDetails = [];

        if (!empty($damageTypeIds)) {
            $damages = DamageType::whereIn('id', $damageTypeIds)->get();
            foreach ($damages as $damage) {
                $damageCost += (float) $damage->repair_cost;
                $damageDetails[] = [
                    'id' => $damage->id,
                    'name' => $damage->name,
                    'cost' => $damage->repair_cost,
                ];
            }
        }

        // Calculate total with material multiplier
        $totalBase = ($baseCost * $materialMultiplier) + $damageCost;

        // Create range (±15%)
        $minEstimate = round($totalBase * 0.85, 2);
        $maxEstimate = round($totalBase * 1.15, 2);

        return [
            'furniture_type' => [
                'id' => $furnitureType->id,
                'name' => $furnitureType->name,
                'base_cost' => $furnitureType->base_repair_cost,
            ],
            'material' => [
                'id' => $material->id,
                'name' => $material->name,
                'multiplier' => $material->repair_multiplier,
            ],
            'damages' => $damageDetails,
            'damage_total' => $damageCost,
            'estimated_min' => $minEstimate,
            'estimated_max' => $maxEstimate,
            'currency' => 'GBP',
        ];
    }
}
