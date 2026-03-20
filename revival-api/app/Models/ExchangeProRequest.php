<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ExchangeProRequest extends Model {
    protected $fillable = ['furniture_type_id','furniture_type','age','condition','brand_category','original_price','customer_name','email','phone','address','postcode','description','photos','estimated_value','status'];
    protected $casts = ['photos' => 'array'];
    public function furnitureType() { return $this->belongsTo(FurnitureType::class); }
}
