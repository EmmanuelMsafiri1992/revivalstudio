<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComparisonPrice;
use App\Models\FurnitureType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComparisonPriceController extends Controller
{
    /**
     * Get all comparison prices (public)
     */
    public function index(): JsonResponse
    {
        $prices = ComparisonPrice::with('furnitureType')
            ->where('is_active', true)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $prices
        ]);
    }

    /**
     * Get comparison price for a specific furniture type (public)
     */
    public function getByFurnitureType(int $furnitureTypeId): JsonResponse
    {
        $price = ComparisonPrice::with('furnitureType')
            ->where('furniture_type_id', $furnitureTypeId)
            ->where('is_active', true)
            ->first();

        if (!$price) {
            // Return default comparison if no specific price set
            $furnitureType = FurnitureType::find($furnitureTypeId);
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => null,
                    'furniture_type_id' => $furnitureTypeId,
                    'retailer_name' => 'IKEA',
                    'product_name' => 'Similar ' . ($furnitureType->name ?? 'Product'),
                    'retail_price' => ($furnitureType->base_value ?? 100) * 2.5,
                    'product_url' => null,
                    'image' => null,
                    'is_default' => true
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $price
        ]);
    }

    /**
     * Get all comparison prices for admin (includes inactive)
     */
    public function adminIndex(): JsonResponse
    {
        $prices = ComparisonPrice::with('furnitureType')->get();

        return response()->json([
            'success' => true,
            'data' => $prices
        ]);
    }

    /**
     * Store a new comparison price
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'furniture_type_id' => 'required|exists:furniture_types,id',
            'retailer_name' => 'required|string|max:100',
            'product_name' => 'required|string|max:255',
            'retail_price' => 'required|numeric|min:0',
            'product_url' => 'nullable|url',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $price = ComparisonPrice::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Comparison price created successfully',
            'data' => $price->load('furnitureType')
        ], 201);
    }

    /**
     * Update a comparison price
     */
    public function update(Request $request, ComparisonPrice $comparisonPrice): JsonResponse
    {
        $validated = $request->validate([
            'furniture_type_id' => 'sometimes|exists:furniture_types,id',
            'retailer_name' => 'sometimes|string|max:100',
            'product_name' => 'sometimes|string|max:255',
            'retail_price' => 'sometimes|numeric|min:0',
            'product_url' => 'nullable|url',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $comparisonPrice->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Comparison price updated successfully',
            'data' => $comparisonPrice->load('furnitureType')
        ]);
    }

    /**
     * Delete a comparison price
     */
    public function destroy(ComparisonPrice $comparisonPrice): JsonResponse
    {
        $comparisonPrice->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comparison price deleted successfully'
        ]);
    }
}
