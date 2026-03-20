<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PremiumUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PremiumAuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:premium_users,email',
            'password'              => 'required|min:8|confirmed',
            'plan'                  => 'nullable|in:monthly,yearly',
        ]);

        $token = bin2hex(random_bytes(32));

        $endsAt = $request->plan === 'yearly'
            ? now()->addYear()
            : now()->addMonth();

        $user = PremiumUser::create([
            'name'                 => $request->name,
            'email'                => $request->email,
            'password'             => Hash::make($request->password),
            'status'               => 'active',
            'plan'                 => $request->plan ?? 'monthly',
            'auth_token'           => $token,
            'subscription_ends_at' => $endsAt,
        ]);

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => ['name' => $user->name, 'email' => $user->email, 'plan' => $user->plan],
            'message' => 'Account created successfully. Welcome to Revival Studio Premium!',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = PremiumUser::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Your subscription is inactive. Please contact us.',
            ], 403);
        }

        $token = bin2hex(random_bytes(32));
        $user->update(['auth_token' => $token]);

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => ['name' => $user->name, 'email' => $user->email, 'plan' => $user->plan],
        ]);
    }
}
