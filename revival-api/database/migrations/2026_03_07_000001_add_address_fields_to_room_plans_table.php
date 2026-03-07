<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('room_plans', function (Blueprint $table) {
            $table->string('house_number')->nullable()->after('phone');
            $table->string('address_line1')->nullable()->after('house_number');
            $table->string('address_line2')->nullable()->after('address_line1');
            $table->string('city')->nullable()->after('address_line2');
            $table->string('postcode')->nullable()->after('city');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('room_plans', function (Blueprint $table) {
            $table->dropColumn(['house_number', 'address_line1', 'address_line2', 'city', 'postcode']);
        });
    }
};
