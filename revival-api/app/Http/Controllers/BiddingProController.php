<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BiddingProRequest;
use App\Models\BiddingOffer;

class BiddingProController extends Controller
{
    public function submit(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string',
            'email' => 'required|email',
        ]);

        $bidding = BiddingProRequest::create([
            'furniture_type' => $request->furniture_type,
            'furniture_type_id' => $request->furniture_type_id,
            'brand' => $request->brand,
            'condition' => $request->condition,
            'damages' => json_encode($request->damages ?? []),
            'delivery' => $request->delivery,
            'postcode' => $request->postcode,
            'floor' => $request->floor,
            'description' => $request->description,
            'customer_name' => $request->customer_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => $bidding,
            'message' => 'Thank you for joining our bidding program. We will revert back to you with best offer for your product.',
        ]);
    }

    public function adminIndex()
    {
        $requests = BiddingProRequest::with('offers')->latest()->get();
        return response()->json(['success' => true, 'data' => $requests]);
    }

    public function adminUpdate(Request $request, $id)
    {
        $bidding = BiddingProRequest::findOrFail($id);
        $bidding->update($request->only(['status']));
        return response()->json(['success' => true, 'data' => $bidding]);
    }

    public function outletIndex(Request $request)
    {
        // Partners can see all pending bidding requests
        $requests = BiddingProRequest::where('status', 'pending')->latest()->get();
        return response()->json(['success' => true, 'data' => $requests]);
    }

    public function outletOffer(Request $request, $id)
    {
        $request->validate([
            'offered_price' => 'required|numeric|min:1',
        ]);

        $biddingRequest = BiddingProRequest::findOrFail($id);

        $offer = BiddingOffer::create([
            'bidding_pro_request_id' => $id,
            'outlet_id' => $request->user()->id, // Authenticated outlet
            'offered_price' => $request->offered_price,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        // Update bidding request status
        $biddingRequest->update(['status' => 'offers_received']);

        return response()->json([
            'success' => true,
            'data' => $offer,
            'message' => 'Your offer has been submitted to the seller.',
        ]);
    }
}
