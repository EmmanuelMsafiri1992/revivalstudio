<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DamageType;
use App\Models\FurnitureType;
use App\Models\InventoryItem;
use App\Models\Material;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\PaymentMethod;
use App\Models\RepairRequest;
use App\Models\RoomPlan;
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

    public function deleteRepairRequest($id)
    {
        $repairRequest = RepairRequest::findOrFail($id);
        $repairRequest->delete();
        return response()->json(['success' => true, 'message' => 'Repair request deleted successfully']);
    }

    public function deleteSellRequest($id)
    {
        $sellRequest = SellRequest::findOrFail($id);
        $sellRequest->delete();
        return response()->json(['success' => true, 'message' => 'Sell request deleted successfully']);
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

    public function createInventoryItem(Request $request)
    {
        $validated = $request->validate([
            'outlet_id'         => 'required|exists:outlets,id',
            'furniture_type_id' => 'nullable|exists:furniture_types,id',
            'item_name'         => 'required|string|max:255',
            'description'       => 'nullable|string',
            'customer_name'     => 'nullable|string|max:255',
            'status'            => 'required|in:pending,collected,repair,sale,sold',
            'repair_cost'       => 'nullable|numeric|min:0',
            'sale_price'        => 'nullable|numeric|min:0',
            'notes'             => 'nullable|string',
        ]);

        $item = InventoryItem::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inventory item created successfully',
            'data'    => $item->load(['furnitureType:id,name,icon', 'outlet:id,name']),
        ], 201);
    }

    public function updateInventoryItem(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);

        $validated = $request->validate([
            'outlet_id'         => 'sometimes|exists:outlets,id',
            'furniture_type_id' => 'sometimes|nullable|exists:furniture_types,id',
            'item_name'         => 'sometimes|string|max:255',
            'description'       => 'sometimes|nullable|string',
            'customer_name'     => 'sometimes|nullable|string|max:255',
            'status'            => 'sometimes|in:pending,collected,repair,sale,sold',
            'repair_cost'       => 'sometimes|nullable|numeric|min:0',
            'sale_price'        => 'sometimes|nullable|numeric|min:0',
            'notes'             => 'sometimes|nullable|string',
        ]);

        $item->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inventory item updated successfully',
            'data'    => $item->fresh(['furnitureType:id,name,icon', 'outlet:id,name']),
        ]);
    }

    public function deleteInventoryItem($id)
    {
        $item = InventoryItem::findOrFail($id);
        $item->delete();
        return response()->json(['success' => true, 'message' => 'Inventory item deleted successfully']);
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

    // Room Plans Management
    public function roomPlans(Request $request)
    {
        $query = RoomPlan::query();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('postcode', 'like', "%{$search}%");
            });
        }

        $plans = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $plans,
        ]);
    }

    public function showRoomPlan($id)
    {
        $plan = RoomPlan::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $plan,
        ]);
    }

    public function updateRoomPlan(Request $request, $id)
    {
        $plan = RoomPlan::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:draft,submitted,contacted,completed',
            'notes' => 'sometimes|nullable|string',
        ]);

        $plan->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Room plan updated successfully',
            'data' => $plan->fresh(),
        ]);
    }

    public function deleteRoomPlan($id)
    {
        $plan = RoomPlan::findOrFail($id);
        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room plan deleted successfully',
        ]);
    }

    // Payment Methods Management
    public function paymentMethods(Request $request)
    {
        $methods = PaymentMethod::orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $methods,
        ]);
    }

    public function createPaymentMethod(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:payment_methods,code',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? PaymentMethod::max('sort_order') + 1;

        $method = PaymentMethod::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Payment method created successfully',
            'data' => $method,
        ]);
    }

    public function updatePaymentMethod(Request $request, $id)
    {
        $method = PaymentMethod::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:payment_methods,code,' . $id,
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $method->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Payment method updated successfully',
            'data' => $method->fresh(),
        ]);
    }

    public function deletePaymentMethod($id)
    {
        $method = PaymentMethod::findOrFail($id);
        $method->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payment method deleted successfully',
        ]);
    }

    // Orders Management
    public function orders(Request $request)
    {
        $query = Order::with(['product.furnitureType', 'product.outlet']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }

        if ($request->has('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $orders = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function showOrder($id)
    {
        $order = Order::with(['product.furnitureType', 'product.outlet'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    public function updateOrder(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'order_status' => 'sometimes|in:pending,confirmed,shipped,delivered,cancelled',
            'payment_status' => 'sometimes|in:pending,paid,failed',
            'notes' => 'nullable|string',
        ]);

        $order->update($validated);

        // If order is cancelled, make product available again
        if (isset($validated['order_status']) && $validated['order_status'] === 'cancelled') {
            $order->product->update(['status' => 'available']);
        }

        // If order is delivered and payment was COD, mark as paid
        if (isset($validated['order_status']) && $validated['order_status'] === 'delivered' && $order->payment_method === 'cod') {
            $order->update(['payment_status' => 'paid']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully',
            'data' => $order->fresh(['product.furnitureType', 'product.outlet']),
        ]);
    }

    public function deleteOrder($id)
    {
        $order = Order::findOrFail($id);

        // Make product available again if order is not delivered
        if ($order->order_status !== 'delivered' && $order->product) {
            $order->product->update(['status' => 'available']);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully',
        ]);
    }
}
