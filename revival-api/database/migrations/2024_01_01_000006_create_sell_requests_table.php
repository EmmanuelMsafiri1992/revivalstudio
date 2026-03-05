<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sell_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('furniture_type_id')->constrained()->onDelete('cascade');
            $table->string('age'); // new, 1-3, 3-5, 5-10, 10+, antique
            $table->string('condition'); // excellent, good, fair, poor
            $table->string('brand_category')->default('standard'); // designer, premium, standard, budget, unknown
            $table->decimal('original_price', 10, 2)->nullable();
            $table->string('customer_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->json('photos')->nullable();
            $table->decimal('estimated_min', 10, 2)->nullable();
            $table->decimal('estimated_max', 10, 2)->nullable();
            $table->string('status')->default('pending'); // pending, contacted, collected, sold, cancelled
            $table->text('notes')->nullable();
            $table->foreignId('outlet_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sell_requests');
    }
};
