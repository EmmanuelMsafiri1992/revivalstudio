<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repair_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('furniture_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('material_id')->constrained()->onDelete('cascade');
            $table->json('damage_type_ids')->nullable();
            $table->string('customer_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->json('photos')->nullable();
            $table->decimal('estimated_min', 10, 2)->nullable();
            $table->decimal('estimated_max', 10, 2)->nullable();
            $table->string('status')->default('pending'); // pending, contacted, scheduled, completed, cancelled
            $table->text('notes')->nullable();
            $table->foreignId('outlet_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repair_requests');
    }
};
