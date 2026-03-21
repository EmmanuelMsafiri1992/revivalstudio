<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SellRequest;
use App\Services\ResaleCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ResaleController extends Controller
{
    public function __construct(
        protected ResaleCalculatorService $calculator
    ) {}

    public function calculate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'furniture_type_id' => 'required|exists:furniture_types,id',
            'age' => 'required|string|in:new,1-3,3-5,5-10,10+,antique',
            'condition' => 'required|string|in:excellent,good,fair,poor',
            'brand_category' => 'nullable|string|in:designer,premium,standard,budget,unknown',
            'original_price' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->calculator->calculate(
            $request->furniture_type_id,
            $request->age,
            $request->condition,
            $request->brand_category ?? 'standard',
            $request->original_price
        );

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function submit(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'furniture_type_id' => 'required|exists:furniture_types,id',
            'age' => 'required|string|in:new,1-3,3-5,5-10,10+,antique',
            'condition' => 'required|string|in:excellent,good,fair,poor',
            'brand_category' => 'nullable|string|in:designer,premium,standard,budget,unknown',
            'original_price' => 'nullable|numeric|min:0',
            'customer_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Calculate estimate
        $estimate = $this->calculator->calculate(
            $request->furniture_type_id,
            $request->age,
            $request->condition,
            $request->brand_category ?? 'standard',
            $request->original_price
        );

        // Create sell request
        $sellRequest = SellRequest::create([
            'furniture_type_id' => $request->furniture_type_id,
            'age' => $request->age,
            'condition' => $request->condition,
            'brand_category' => $request->brand_category ?? 'standard',
            'original_price' => $request->original_price,
            'customer_name' => $request->customer_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'photos' => $request->photos ?? [],
            'estimated_min' => $estimate['estimated_min'],
            'estimated_max' => $estimate['estimated_max'],
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sell request submitted successfully',
            'data' => [
                'id' => $sellRequest->id,
                'estimate' => $estimate,
            ],
        ], 201);
    }
}
