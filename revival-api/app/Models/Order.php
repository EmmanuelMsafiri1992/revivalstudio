<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'product_id',
        'customer_name',
        'email',
        'phone',
        'house_number',
        'address_line1',
        'address_line2',
        'city',
        'postcode',
        'payment_method',
        'payment_status',
        'order_status',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getFullAddressAttribute()
    {
        $address = $this->house_number . ' ' . $this->address_line1;
        if ($this->address_line2) {
            $address .= ', ' . $this->address_line2;
        }
        $address .= ', ' . $this->city . ' ' . $this->postcode;
        return $address;
    }

    public static function generateOrderNumber()
    {
        $prefix = 'RS';
        $date = now()->format('ymd');
        $random = strtoupper(substr(uniqid(), -4));
        return "{$prefix}{$date}{$random}";
    }
}
