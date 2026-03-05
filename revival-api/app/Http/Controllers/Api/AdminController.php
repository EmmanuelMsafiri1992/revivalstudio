<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DamageType;
use App\Models\FurnitureType;
use App\Models\InventoryItem;
use App\Models\Material;
use App\Models\Outlet;
use App\Models\RepairRequest;
use App\Models\SellRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_outlets' => Outlet::count(),
            'active_outlets' => Outlet::active()->count(),
            'total_repair_requests' => RepairRequest::count(),
            'pending_repair_requests' => RepairRequest::where('status', 'pending')->count(),
            'total_sell_requests' => SellRequest::count(),
            'pending_sell_requests' => SellRequest::where('status', 'pending')->count(),
            'total_inventory' => InventoryItem::count(),
            'items_for_sale' => InventoryItem::where('status', 'sale')->count(),
            'total_revenue' => InventoryItem::where('status', 'sold')->sum('sale_price'),
            'furniture_types' => FurnitureType::count(),
            'materials' => Material::count(),
            'damage_types' => DamageType::count(),
        ];

        $recentRepairRequests = RepairRequest::with('furnitureType:id,name,icon')
            ->latest()
            ->take(5)
            ->get();

        $recentSellRequests = SellRequest::with('furnitureType:id,name,icon')
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_repair_requests' => $recentRepairRequests,
                'recent_sell_requests' => $recentSellRequests,
            ],
        ]);
    }

    // Outlets Management
    public function outlets(Request $request)
    {
        $query = Outlet::query();

        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('active', false);
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $outlets = $query->withCount('inventoryItems')
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $outlets,
        ]);
    }

    public function updateOutlet(Request $request, $id)
    {
        $outlet = Outlet::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:outlets,email,' . $id,
            'location' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:50',
            'address' => 'sometimes|string',
            'active' => 'sometimes|boolean',
        ]);

        $outlet->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Outlet updated successfully',
            'data' => $outlet,
        ]);
    }

    public function createOutlet(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:outlets,email',
            'password' => 'required|string|min:8',
            'location' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $validated['active'] = true;

        $outlet = Outlet::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Outlet created successfully',
            'data' => $outlet,
        ]);
    }

    // Repair Requests Management
    public function repairRequests(Request $request)
    {
        $query = RepairRequest::with(['furnitureType:id,name,icon', 'material:id,name', 'outlet:id,name']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $requests = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    public function updateRepairRequest(Request $request, $id)
    {
        $repairRequest = RepairRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,contacted,scheduled,completed,cancelled',
            'notes' => 'sometimes|string',
            'outlet_id' => 'sometimes|nullable|exists:outlets,id',
        ]);

        $repairRequest->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Repair request updated successfully',
            'data' => $repairRequest->fresh(['furnitureType', 'material', 'outlet']),
        ]);
    }

    // Sell Requests Management
    public function sellRequests(Request $request)
    {
        $query = SellRequest::with(['furnitureType:id,name,icon', 'outlet:id,name']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $requests = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    public function updateSellRequest(Request $request, $id)
    {
        $sellRequest = SellRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,contacted,collected,sold,cancelled',
            'notes' => 'sometimes|string',
            'outlet_id' => 'sometimes|nullable|exists:outlets,id',
        ]);

        $sellRequest->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Sell request updated successfully',
            'data' => $sellRequest->fresh(['furnitureType', 'outlet']),
        ]);
    }

    // Inventory Management
    public function inventoryItems(Request $request)
    {
        $query = InventoryItem::with(['furnitureType:id,name,icon', 'outlet:id,name,location']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('outlet_id')) {
            $query->where('outlet_id', $request->outlet_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('item_name', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        $items = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    // Furniture Types Management
    public function furnitureTypes(Request $request)
    {
        $types = FurnitureType::orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }

    public function createFurnitureType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:10',
            'base_repair_cost' => 'required|numeric|min:0',
            'base_value' => 'required|numeric|min:0',
            'sort_order' => 'nullable|integer',
            'active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['active'] = $validated['active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? FurnitureType::max('sort_order') + 1;

        $type = FurnitureType::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Furniture type created successfully',
            'data' => $type,
        ]);
    }

    public function updateFurnitureType(Request $request, $id)
    {
        $type = FurnitureType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'icon' => 'nullable|string|max:10',
            'base_repair_cost' => 'sometimes|numeric|min:0',
            'base_value' => 'sometimes|numeric|min:0',
            'sort_order' => 'nullable|integer',
            'active' => 'sometimes|boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $type->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Furniture type updated successfully',
            'data' => $type,
        ]);
    }

    public function deleteFurnitureType($id)
    {
        $type = FurnitureType::findOrFail($id);
        $type->delete();

        return response()->json([
            'success' => true,
            'message' => 'Furniture type deleted successfully',
        ]);
    }

    // Materials Management
    public function materials(Request $request)
    {
        $materials = Material::orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $materials,
        ]);
    }

    public function createMaterial(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:10',
            'repair_multiplier' => 'required|numeric|min:0',
            'sort_order' => 'nullable|integer',
            'active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['active'] = $validated['active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? Material::max('sort_order') + 1;

        $material = Material::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Material created successfully',
            'data' => $material,
        ]);
    }

    public function updateMaterial(Request $request, $id)
    {
        $material = Material::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'icon' => 'nullable|string|max:10',
            'repair_multiplier' => 'sometimes|numeric|min:0',
            'sort_order' => 'nullable|integer',
            'active' => 'sometimes|boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $material->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Material updated successfully',
            'data' => $material,
        ]);
    }

    public function deleteMaterial($id)
    {
        $material = Material::findOrFail($id);
        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Material deleted successfully',
        ]);
    }

    // Damage Types Management
    public function damageTypes(Request $request)
    {
        $types = DamageType::orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $types,
        ]);
    }

    public function createDamageType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:10',
            'repair_cost' => 'required|numeric|min:0',
            'sort_order' => 'nullable|integer',
            'active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['active'] = $validated['active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? DamageType::max('sort_order') + 1;

        $type = DamageType::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Damage type created successfully',
            'data' => $type,
        ]);
    }

    public function updateDamageType(Request $request, $id)
    {
        $type = DamageType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'icon' => 'nullable|string|max:10',
            'repair_cost' => 'sometimes|numeric|min:0',
            'sort_order' => 'nullable|integer',
            'active' => 'sometimes|boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $type->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Damage type updated successfully',
            'data' => $type,
        ]);
    }

    public function deleteDamageType($id)
    {
        $type = DamageType::findOrFail($id);
        $type->delete();

        return response()->json([
            'success' => true,
            'message' => 'Damage type deleted successfully',
        ]);
    }
}
