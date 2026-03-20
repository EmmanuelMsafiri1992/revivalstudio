<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\SiteSetting;

class NearMeController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'postcode'     => 'required|string',
            'distance'     => 'required|numeric|min:1|max:100',
            'product_name' => 'nullable|string',
            'lat'          => 'nullable|numeric|between:-90,90',
            'lng'          => 'nullable|numeric|between:-180,180',
        ]);

        // Store search request
        \App\Models\NearMeRequest::create([
            'postcode'      => $request->postcode,
            'distance_miles'=> $request->distance,
            'product_name'  => $request->product_name,
        ]);

        // Exclude the discounted outlet from Near Me results
        $discountedEmail = SiteSetting::getValue('contact_email_discounted', 'discounted@revivalstudio.co.uk');

        $query = Product::with(['furnitureType', 'outlet'])
            ->where('status', 'available')
            ->whereDoesntHave('outlet', function ($q) use ($discountedEmail) {
                $q->where('email', $discountedEmail);
            });

        // Filter by product name if provided
        if ($request->product_name) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->product_name . '%')
                  ->orWhereHas('furnitureType', function ($q2) use ($request) {
                      $q2->where('name', 'like', '%' . $request->product_name . '%');
                  });
            });
        }

        $customerLat = $request->lat;
        $customerLng = $request->lng;
        $distanceMiles = (float) $request->distance;

        if ($customerLat && $customerLng) {
            // Real distance filtering: only load outlets that have coordinates,
            // then filter in PHP using Haversine formula
            $products = $query->whereHas('outlet', function ($q) {
                $q->whereNotNull('latitude')->whereNotNull('longitude');
            })->get();

            $filtered = $products->filter(function ($product) use ($customerLat, $customerLng, $distanceMiles) {
                $outlet = $product->outlet;
                if (!$outlet || !$outlet->latitude || !$outlet->longitude) return false;

                $miles = $this->haversine(
                    (float) $customerLat,
                    (float) $customerLng,
                    (float) $outlet->latitude,
                    (float) $outlet->longitude
                );

                $product->distance_miles = round($miles, 1);
                return $miles <= $distanceMiles;
            })->sortBy('distance_miles')->values();

        } else {
            // Fallback: postcode area prefix matching
            $postcodeArea = strtoupper(substr(str_replace(' ', '', $request->postcode), 0, 3));
            $query->whereHas('outlet', function ($q) use ($postcodeArea) {
                $q->where('postcode', 'like', $postcodeArea . '%')
                  ->orWhere('postcode', 'like', '%' . $postcodeArea . '%');
            });

            $filtered = $query->limit(20)->get();
            $filtered->each(function ($p) { $p->distance_miles = null; });
        }

        return response()->json([
            'success'     => true,
            'data'        => $filtered,
            'total'       => $filtered->count(),
            'search_area' => $request->postcode,
            'distance'    => $request->distance,
            'using_gps'   => (bool)($customerLat && $customerLng),
        ]);
    }

    /**
     * Haversine formula — returns distance in miles between two lat/lng points.
     */
    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 3958.8; // miles
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2
           + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $earthRadius * 2 * asin(sqrt($a));
    }

    public function adminIndex()
    {
        $requests = \App\Models\NearMeRequest::latest()->get();
        return response()->json(['success' => true, 'data' => $requests]);
    }

    public function adminUpdate(Request $request, $id)
    {
        $nearMe = \App\Models\NearMeRequest::findOrFail($id);
        $nearMe->update($request->only(['status']));
        return response()->json(['success' => true, 'data' => $nearMe]);
    }
}
