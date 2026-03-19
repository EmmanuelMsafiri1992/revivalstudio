<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class BiddingOffer extends Model {
    protected $fillable = ['bidding_pro_request_id','outlet_id','offered_price','message','status'];
    public function biddingRequest() { return $this->belongsTo(BiddingProRequest::class); }
    public function outlet() { return $this->belongsTo(Outlet::class); }
}
