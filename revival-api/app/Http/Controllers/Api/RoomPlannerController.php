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

        try {
            $result = $this->planner->generatePlan(
                $request->room_type,
                $request->room_size,
                $request->style,
                $request->budget
            );
        } catch (\Throwable $e) {
            // Catalog may be empty — return a valid empty plan so submit still works
            $result = [
                'room'         => ['type' => $request->room_type, 'name' => $request->room_type],
                'size'         => ['key' => $request->room_size, 'name' => $request->room_size],
                'style'        => ['key' => $request->style, 'name' => $request->style],
                'budget'       => $request->budget,
                'items'        => [],
                'total_cost'   => 0,
                'within_budget' => true,
                'currency'     => 'GBP',
            ];
        }

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
            'phone' => 'required|string|max:50',
            'house_number' => 'required|string|max:50',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'postcode' => 'required|string|max:20',
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
            'house_number' => $request->house_number,
            'address_line1' => $request->address_line1,
            'address_line2' => $request->address_line2,
            'city' => $request->city,
            'postcode' => $request->postcode,
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
