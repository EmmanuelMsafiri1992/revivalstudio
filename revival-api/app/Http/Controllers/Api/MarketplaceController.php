<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MarketplaceController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $outlet = $request->user();

        $stats = [
            'pending' => InventoryItem::where('outlet_id', $outlet->id)
                ->where('status', 'pending')
                ->count(),
            'collected' => InventoryItem::where('outlet_id', $outlet->id)
                ->where('status', 'collected')
                ->count(),
            'repair' => InventoryItem::where('outlet_id', $outlet->id)
                ->where('status', 'repair')
                ->count(),
            'sale' => InventoryItem::where('outlet_id', $outlet->id)
                ->where('status', 'sale')
                ->count(),
            'sold' => InventoryItem::where('outlet_id', $outlet->id)
                ->where('status', 'sold')
                ->count(),
            'total_revenue' => InventoryItem::where('outlet_id', $outlet->id)
                ->where('status', 'sold')
                ->sum('sale_price'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    public function inventory(Request $request): JsonResponse
    {
        $outlet = $request->user();

        $query = InventoryItem::with('furnitureType:id,name,icon')
            ->where('outlet_id', $outlet->id);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $items = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function updateItem(Request $request, int $id): JsonResponse
    {
        $outlet = $request->user();

        $item = InventoryItem::where('outlet_id', $outlet->id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'nullable|string|in:pending,collected,repair,sale,sold',
            'repair_cost' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $item->update($request->only(['status', 'repair_cost', 'sale_price', 'notes']));

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully',
            'data' => $item->fresh(['furnitureType']),
        ]);
    }

    public function createItem(Request $request): JsonResponse
    {
        $outlet = $request->user();

        $validator = Validator::make($request->all(), [
            'furniture_type_id' => 'nullable|exists:furniture_types,id',
            'item_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'customer_name' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:pending,collected,repair,sale',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $item = InventoryItem::create([
            'outlet_id' => $outlet->id,
            'furniture_type_id' => $request->furniture_type_id,
            'item_name' => $request->item_name,
            'description' => $request->description,
            'customer_name' => $request->customer_name,
            'status' => $request->status ?? 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item created successfully',
            'data' => $item->fresh(['furnitureType']),
        ], 201);
    }
}
