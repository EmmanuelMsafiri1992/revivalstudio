<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('exchange_pro_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('furniture_type_id')->nullable()->constrained()->nullOnDelete();
            $table->string('furniture_type')->nullable();
            $table->string('age')->nullable();
            $table->string('condition')->nullable();
            $table->string('brand_category')->nullable();
            $table->decimal('original_price', 10, 2)->nullable();
            $table->string('customer_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('postcode')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('exchange_pro_requests'); }
};
