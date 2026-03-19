<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Co2Emission extends Model {
    protected $fillable = ['product_name','new_co2','refurbished_co2','transport_co2','net_co2_saved'];
}
