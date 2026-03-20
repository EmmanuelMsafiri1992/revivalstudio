<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class BiddingProRequest extends Model {
    protected $fillable = ['furniture_type','furniture_type_id','brand','condition','damages','delivery','postcode','floor','description','customer_name','email','phone','desired_price','whatsapp','status'];
    protected $casts = ['desired_price' => 'decimal:2'];
    public function offers() { return $this->hasMany(BiddingOffer::class); }
}
