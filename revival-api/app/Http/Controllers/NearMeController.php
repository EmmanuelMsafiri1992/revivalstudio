<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class NearMeController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'postcode' => 'required|string',
            'distance' => 'required|numeric|min:1|max:100',
            'product_name' => 'nullable|string',
        ]);

        // Store search request
        \App\Models\NearMeRequest::create([
            'postcode' => $request->postcode,
            'distance_miles' => $request->distance,
            'product_name' => $request->product_name,
        ]);

        // Search products by postcode proximity
        // For now, search by city/postcode match from outlet
        $query = Product::with(['furnitureType', 'outlet'])
            ->where('status', 'available');

        if ($request->product_name) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->product_name . '%')
                  ->orWhereHas('furnitureType', function($q2) use ($request) {
                      $q2->where('name', 'like', '%' . $request->product_name . '%');
                  });
            });
        }

        // Filter by postcode area (first 3 chars match)
        $postcodeArea = strtoupper(substr(str_replace(' ', '', $request->postcode), 0, 3));
        $query->whereHas('outlet', function($q) use ($postcodeArea, $request) {
            $q->where(function($q2) use ($postcodeArea, $request) {
                $q2->where('postcode', 'like', $postcodeArea . '%')
                   ->orWhere('postcode', 'like', '%' . $postcodeArea . '%');
            });
        });

        $products = $query->limit(20)->get();

        return response()->json([
            'success' => true,
            'data' => $products,
            'search_area' => $request->postcode,
            'distance' => $request->distance,
        ]);
    }

    public function adminIndex()
    {
        $requests = \App\Models\NearMeRequest::latest()->get();
        return response()->json(['success' => true, 'data' => $requests]);
    }
}
