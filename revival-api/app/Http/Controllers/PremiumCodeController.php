<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PremiumCode;
use Illuminate\Support\Str;

class PremiumCodeController extends Controller
{
    // Public: verify a code entered by the user
    public function verify(Request $request)
    {
        $request->validate(['code' => 'required|string']);

        $code = PremiumCode::where('code', strtoupper(trim($request->code)))->first();

        if (!$code || !$code->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired access code.',
            ], 422);
        }

        // Increment usage count
        $code->increment('used_count');

        return response()->json([
            'success' => true,
            'message' => 'Access granted.',
        ]);
    }

    // Admin: list all codes
    public function adminIndex()
    {
        $codes = PremiumCode::latest()->get();
        return response()->json(['success' => true, 'data' => $codes]);
    }

    // Admin: create a new code
    public function adminStore(Request $request)
    {
        $request->validate([
            'code'        => 'nullable|string|max:50|unique:premium_codes,code',
            'description' => 'nullable|string|max:255',
            'is_active'   => 'boolean',
            'max_uses'    => 'nullable|integer|min:1',
            'expires_at'  => 'nullable|date',
        ]);

        $code = PremiumCode::create([
            'code'        => strtoupper($request->code ?? Str::upper(Str::random(10))),
            'description' => $request->description,
            'is_active'   => $request->is_active ?? true,
            'max_uses'    => $request->max_uses,
            'expires_at'  => $request->expires_at,
        ]);

        return response()->json(['success' => true, 'data' => $code], 201);
    }

    // Admin: update a code
    public function adminUpdate(Request $request, $id)
    {
        $code = PremiumCode::findOrFail($id);

        $request->validate([
            'description' => 'nullable|string|max:255',
            'is_active'   => 'boolean',
            'max_uses'    => 'nullable|integer|min:1',
            'expires_at'  => 'nullable|date',
        ]);

        $code->update($request->only(['description', 'is_active', 'max_uses', 'expires_at']));

        return response()->json(['success' => true, 'data' => $code]);
    }

    // Admin: delete a code
    public function adminDestroy($id)
    {
        PremiumCode::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Code deleted.']);
    }
}
