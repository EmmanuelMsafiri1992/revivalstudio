<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class NearMeRequest extends Model {
    protected $fillable = ['postcode', 'distance_miles', 'product_name'];
}
