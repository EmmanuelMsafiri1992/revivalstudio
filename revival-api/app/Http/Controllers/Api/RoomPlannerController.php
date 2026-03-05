<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoomPlan;
use App\Services\RoomPlannerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoomPlannerController extends Controller
{
    public function __construct(
        protected RoomPlannerService $planner
    ) {}

    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'room_type' => 'required|string|in:livingRoom,bedroom,diningRoom,homeOffice,hallway',
            'room_size' => 'required|string|in:small,medium,large',
            'style' => 'required|string|in:modern,classic,midCentury,scandinavian,industrial,rustic',
            'budget' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->planner->generatePlan(
            $request->room_type,
            $request->room_size,
            $request->style,
            $request->budget
        );

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    public function submit(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'room_type' => 'required|string|in:livingRoom,bedroom,diningRoom,homeOffice,hallway',
            'room_size' => 'required|string|in:small,medium,large',
            'style' => 'required|string|in:modern,classic,midCentury,scandinavian,industrial,rustic',
            'budget' => 'nullable|numeric|min:0',
            'selected_items' => 'nullable|array',
            'total_cost' => 'nullable|numeric|min:0',
            'customer_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Create room plan
        $roomPlan = RoomPlan::create([
            'room_type' => $request->room_type,
            'room_size' => $request->room_size,
            'style' => $request->style,
            'budget' => $request->budget,
            'selected_items' => $request->selected_items,
            'total_cost' => $request->total_cost,
            'customer_name' => $request->customer_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'status' => 'submitted',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Room plan enquiry submitted successfully',
            'data' => [
                'id' => $roomPlan->id,
            ],
        ], 201);
    }
}
