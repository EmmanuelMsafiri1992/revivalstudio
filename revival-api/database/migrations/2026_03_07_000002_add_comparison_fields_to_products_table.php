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
        Schema::table('products', function (Blueprint $table) {
            $table->string('comparison_retailer')->nullable()->after('featured');
            $table->string('comparison_product_name')->nullable()->after('comparison_retailer');
            $table->decimal('comparison_price', 10, 2)->nullable()->after('comparison_product_name');
            $table->string('comparison_url')->nullable()->after('comparison_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['comparison_retailer', 'comparison_product_name', 'comparison_price', 'comparison_url']);
        });
    }
};
