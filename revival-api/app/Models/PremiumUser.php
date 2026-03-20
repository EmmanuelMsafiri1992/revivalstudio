<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PremiumUser extends Model
{
    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
        'plan',
        'auth_token',
        'subscription_ends_at',
    ];

    protected $hidden = ['password', 'auth_token'];

    protected $casts = [
        'subscription_ends_at' => 'datetime',
    ];
}
