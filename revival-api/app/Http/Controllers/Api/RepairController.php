<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RepairRequest;
use App\Services\RepairCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RepairController extends Controller
{
    public function __construct(
        protected RepairCalculatorService $calculator
    ) {}

    public function calculate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'furniture_type_id' => 'required|exists:furniture_types,id',
            'material_id' => 'required|exists:materials,id',
            'damage_type_ids' => 'nullable|array',
            'damage_type_ids.*' => 'exists:damage_types,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->calculator->calculate(
            $request->furniture_type_id,
            $request->material_id,
            $request->damage_type_ids ?? []
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
            'material_id' => 'required|exists:materials,id',
            'damage_type_ids' => 'nullable|array',
            'damage_type_ids.*' => 'exists:damage_types,id',
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
            $request->material_id,
            $request->damage_type_ids ?? []
        );

        // Create repair request
        $repairRequest = RepairRequest::create([
            'furniture_type_id' => $request->furniture_type_id,
            'material_id' => $request->material_id,
            'damage_type_ids' => $request->damage_type_ids,
            'customer_name' => $request->customer_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'estimated_min' => $estimate['estimated_min'],
            'estimated_max' => $estimate['estimated_max'],
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Repair request submitted successfully',
            'data' => [
                'id' => $repairRequest->id,
                'estimate' => $estimate,
            ],
        ], 201);
    }
}
