<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bidding_pro_requests', function (Blueprint $table) {
            $table->id();
            $table->string('furniture_type')->nullable();
            $table->foreignId('furniture_type_id')->nullable()->constrained()->nullOnDelete();
            $table->string('brand')->nullable();
            $table->string('condition')->nullable();
            $table->json('damages')->nullable();
            $table->string('delivery')->nullable();
            $table->string('postcode')->nullable();
            $table->string('floor')->nullable();
            $table->text('description')->nullable();
            $table->string('customer_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('bidding_pro_requests'); }
};
