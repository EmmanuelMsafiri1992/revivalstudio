<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_plans', function (Blueprint $table) {
            $table->id();
            $table->string('room_type'); // livingRoom, bedroom, diningRoom, homeOffice, hallway
            $table->string('room_size'); // small, medium, large
            $table->string('style'); // modern, classic, midCentury, scandinavian, industrial, rustic
            $table->decimal('budget', 10, 2)->nullable();
            $table->json('selected_items')->nullable();
            $table->decimal('total_cost', 10, 2)->nullable();
            $table->string('customer_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('status')->default('draft'); // draft, submitted, contacted, completed
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_plans');
    }
};
