<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class OutletAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $outlet = Outlet::where('email', $request->email)->first();

        if (!$outlet || !Hash::check($request->password, $outlet->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
            ], 401);
        }

        if (!$outlet->active) {
            return response()->json([
                'success' => false,
                'message' => 'This outlet account is inactive',
            ], 403);
        }

        // Create token
        $token = $outlet->createToken('outlet-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'outlet' => [
                    'id' => $outlet->id,
                    'name' => $outlet->name,
                    'email' => $outlet->email,
                    'location' => $outlet->location,
                ],
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        $outlet = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $outlet->id,
                'name' => $outlet->name,
                'email' => $outlet->email,
                'location' => $outlet->location,
                'phone' => $outlet->phone,
                'address' => $outlet->address,
                'city' => $outlet->city,
                'postcode' => $outlet->postcode,
                'latitude' => $outlet->latitude,
                'longitude' => $outlet->longitude,
                'description' => $outlet->description,
                'opening_hours' => $outlet->opening_hours,
            ],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $outlet = $request->user();

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'postcode' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'description' => 'nullable|string|max:1000',
            'opening_hours' => 'nullable|array',
        ]);

        $outlet->update($request->only([
            'name', 'phone', 'address', 'city', 'postcode',
            'latitude', 'longitude', 'description', 'opening_hours'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $outlet->fresh(),
        ]);
    }
}
