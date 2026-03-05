<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DamageType;
use App\Models\FurnitureCatalog;
use App\Models\FurnitureType;
use App\Models\Material;
use App\Services\RoomPlannerService;
use App\Services\ResaleCalculatorService;
use Illuminate\Http\JsonResponse;

class FurnitureController extends Controller
{
    public function furnitureTypes(): JsonResponse
    {
        $types = FurnitureType::active()
            ->ordered()
            ->get(['id', 'name', 'slug', 'icon', 'base_repair_cost', 'base_value']);

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }

    public function materials(): JsonResponse
    {
        $materials = Material::active()
            ->ordered()
            ->get(['id', 'name', 'slug', 'icon', 'repair_multiplier']);

        return response()->json([
            'success' => true,
            'data' => $materials,
        ]);
    }

    public function damageTypes(): JsonResponse
    {
        $damages = DamageType::active()
            ->ordered()
            ->get(['id', 'name', 'slug', 'icon', 'repair_cost']);

        return response()->json([
            'success' => true,
            'data' => $damages,
        ]);
    }

    public function catalog(): JsonResponse
    {
        $catalog = FurnitureCatalog::with('furnitureType:id,name,icon')
            ->available()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $catalog,
        ]);
    }

    public function roomTypes(RoomPlannerService $service): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $service->getRoomTypes(),
        ]);
    }

    public function roomSizes(RoomPlannerService $service): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $service->getRoomSizes(),
        ]);
    }

    public function styles(RoomPlannerService $service): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $service->getStyles(),
        ]);
    }

    public function resaleOptions(ResaleCalculatorService $service): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'age' => $service->getAgeOptions(),
                'condition' => $service->getConditionOptions(),
                'brand' => $service->getBrandOptions(),
            ],
        ]);
    }
}
