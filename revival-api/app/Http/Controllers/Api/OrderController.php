<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Get active payment methods for checkout
     */
    public function paymentMethods(): JsonResponse
    {
        $methods = PaymentMethod::active()->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $methods,
        ]);
    }

    /**
     * Create a new order
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'customer_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'house_number' => 'required|string|max:50',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'postcode' => 'required|string|max:20',
            'payment_method' => 'required|string|exists:payment_methods,code',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Get product
        $product = Product::findOrFail($request->product_id);

        // Check if product is available
        if ($product->status !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'This product is no longer available for purchase.',
            ], 400);
        }

        // Create order
        $order = Order::create([
            'order_number' => Order::generateOrderNumber(),
            'product_id' => $product->id,
            'customer_name' => $request->customer_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'house_number' => $request->house_number,
            'address_line1' => $request->address_line1,
            'address_line2' => $request->address_line2,
            'city' => $request->city,
            'postcode' => $request->postcode,
            'payment_method' => $request->payment_method,
            'payment_status' => $request->payment_method === 'cod' ? 'pending' : 'pending',
            'order_status' => 'pending',
            'total_amount' => $product->price,
            'notes' => $request->notes,
        ]);

        // Update product status to reserved
        $product->update(['status' => 'reserved']);

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully',
            'data' => [
                'order_number' => $order->order_number,
                'id' => $order->id,
            ],
        ], 201);
    }

    /**
     * Get order by order number (for confirmation page)
     */
    public function show($orderNumber): JsonResponse
    {
        $order = Order::with(['product.furnitureType', 'product.outlet'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        // Get payment method details
        $paymentMethod = PaymentMethod::where('code', $order->payment_method)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order,
                'payment_method_details' => $paymentMethod,
            ],
        ]);
    }
}
