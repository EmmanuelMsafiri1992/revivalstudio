<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomPlan extends Model
{
    protected $fillable = [
        'room_type',
        'room_size',
        'style',
        'budget',
        'selected_items',
        'total_cost',
        'customer_name',
        'email',
        'phone',
        'house_number',
        'address_line1',
        'address_line2',
        'city',
        'postcode',
        'status',
        'notes',
    ];

    protected $casts = [
        'selected_items' => 'array',
        'budget' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];
}
