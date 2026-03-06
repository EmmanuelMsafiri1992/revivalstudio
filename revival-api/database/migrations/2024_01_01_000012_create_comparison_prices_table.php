<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comparison_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('furniture_type_id')->constrained()->onDelete('cascade');
            $table->string('retailer_name')->default('IKEA'); // IKEA, Argos, Amazon, etc.
            $table->string('product_name'); // e.g., "KIVIK Sofa"
            $table->decimal('retail_price', 10, 2); // New retail price
            $table->string('product_url')->nullable(); // Link to retailer website
            $table->string('image')->nullable(); // Product image
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comparison_prices');
    }
};
