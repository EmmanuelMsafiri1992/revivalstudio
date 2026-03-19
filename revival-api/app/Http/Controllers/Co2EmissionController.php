<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Co2Emission;

class Co2EmissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Co2Emission::query();
        if ($request->product_name) {
            $query->where('product_name', 'like', '%' . $request->product_name . '%');
        }
        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_name' => 'required|string',
            'new_co2' => 'required|numeric',
            'refurbished_co2' => 'required|numeric',
            'transport_co2' => 'required|numeric',
            'net_co2_saved' => 'required|numeric',
        ]);
        $emission = Co2Emission::create($request->all());
        return response()->json(['success' => true, 'data' => $emission]);
    }

    public function update(Request $request, $id)
    {
        $emission = Co2Emission::findOrFail($id);
        $emission->update($request->all());
        return response()->json(['success' => true, 'data' => $emission]);
    }

    public function destroy($id)
    {
        Co2Emission::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Deleted']);
    }
}
