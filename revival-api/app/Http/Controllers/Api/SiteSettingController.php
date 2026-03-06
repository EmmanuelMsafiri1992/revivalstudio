<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SiteSettingController extends Controller
{
    /**
     * Get all public settings (for frontend)
     */
    public function index(): JsonResponse
    {
        $settings = SiteSetting::getAllGrouped();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Get settings by group (for frontend)
     */
    public function getByGroup(string $group): JsonResponse
    {
        $settings = SiteSetting::getByGroup($group);

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Get a single setting value (for frontend)
     */
    public function show(string $key): JsonResponse
    {
        $setting = SiteSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'key' => $setting->key,
                'value' => SiteSetting::getValue($key),
                'type' => $setting->type,
                'group' => $setting->group,
            ],
        ]);
    }

    /**
     * Get all settings for admin panel
     */
    public function adminIndex(): JsonResponse
    {
        $settings = SiteSetting::orderBy('group')
            ->orderBy('id')
            ->get()
            ->map(function ($setting) {
                $value = $setting->value;
                if ($setting->type === 'json') {
                    $value = json_decode($value, true);
                }
                return [
                    'id' => $setting->id,
                    'key' => $setting->key,
                    'value' => $value,
                    'type' => $setting->type,
                    'group' => $setting->group,
                    'label' => $setting->label,
                    'description' => $setting->description,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Update a setting (admin only)
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $setting = SiteSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }

        $value = $request->input('value');

        // Convert to JSON string if it's an array/object
        if ($setting->type === 'json' && (is_array($value) || is_object($value))) {
            $value = json_encode($value);
        }

        $setting->value = $value;
        $setting->save();

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => [
                'key' => $setting->key,
                'value' => $setting->type === 'json' ? json_decode($setting->value, true) : $setting->value,
                'type' => $setting->type,
                'group' => $setting->group,
            ],
        ]);
    }

    /**
     * Bulk update settings (admin only)
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $settings = $request->input('settings', []);

        foreach ($settings as $key => $value) {
            SiteSetting::setValue($key, $value);
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
        ]);
    }

    /**
     * Create a new setting (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string|unique:site_settings,key',
            'value' => 'nullable',
            'type' => 'required|in:text,json,number,boolean',
            'group' => 'required|string',
            'label' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $value = $request->input('value');
        if ($request->input('type') === 'json' && (is_array($value) || is_object($value))) {
            $value = json_encode($value);
        }

        $setting = SiteSetting::create([
            'key' => $request->input('key'),
            'value' => $value,
            'type' => $request->input('type'),
            'group' => $request->input('group'),
            'label' => $request->input('label'),
            'description' => $request->input('description'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Setting created successfully',
            'data' => $setting,
        ], 201);
    }

    /**
     * Delete a setting (admin only)
     */
    public function destroy(string $key): JsonResponse
    {
        $setting = SiteSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }

        $setting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Setting deleted successfully',
        ]);
    }
}
