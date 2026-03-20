<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('co2_new', 8, 2)->nullable()->after('comparison_url')
                  ->comment('kg CO2 if bought new');
            $table->decimal('co2_refurbished', 8, 2)->nullable()->after('co2_new')
                  ->comment('kg CO2 of this refurbished item');
            $table->decimal('co2_saved', 8, 2)->nullable()->after('co2_refurbished')
                  ->comment('kg CO2 saved vs buying new');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['co2_new', 'co2_refurbished', 'co2_saved']);
        });
    }
};
