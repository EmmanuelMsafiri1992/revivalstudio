<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ExchangeProRequest;
use App\Models\FurnitureType;

class ExchangeProController extends Controller
{
    public function calculate(Request $request)
    {
        // Use the same logic as resale, but return 20% more
        $furnitureType = FurnitureType::find($request->furniture_type_id);
        $baseValue = $furnitureType ? $furnitureType->base_value : 100;

        $conditionMultipliers = [
            'like_new' => 0.8, 'good' => 0.6, 'average' => 0.4,
            'needs_repair' => 0.2, 'poor' => 0.1,
        ];
        $multiplier = $conditionMultipliers[$request->condition] ?? 0.5;

        $baseMin = $baseValue * $multiplier;
        $baseMax = $baseMin * 1.3;

        // Apply 20% premium bonus
        $estimatedMin = round($baseMin * 1.2);
        $estimatedMax = round($baseMax * 1.2);

        return response()->json([
            'success' => true,
            'data' => [
                'estimated_min' => $estimatedMin,
                'estimated_max' => $estimatedMax,
                'currency' => 'GBP',
                'premium_bonus' => '20%',
                'furniture_type' => $furnitureType?->name,
            ]
        ]);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string',
            'email' => 'required|email',
        ]);

        $exchange = ExchangeProRequest::create([
            'furniture_type_id' => $request->furniture_type_id,
            'furniture_type' => $request->furniture_type,
            'age' => $request->age,
            'condition' => $request->condition,
            'brand_category' => $request->brand_category,
            'original_price' => $request->original_price,
            'customer_name' => $request->customer_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'postcode' => $request->postcode,
            'description' => $request->description,
            'estimated_value' => $request->estimated_value,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => $exchange,
            'message' => 'Your Exchange Pro request has been submitted! We\'ll contact you with your premium offer.',
        ]);
    }

    public function adminIndex()
    {
        $requests = ExchangeProRequest::with('furnitureType')->latest()->get();
        return response()->json(['success' => true, 'data' => $requests]);
    }

    public function adminUpdate(Request $request, $id)
    {
        $exchange = ExchangeProRequest::findOrFail($id);
        $exchange->update($request->only(['status']));
        return response()->json(['success' => true, 'data' => $exchange]);
    }
}
