<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('co2_emissions', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->decimal('new_co2', 8, 2);
            $table->decimal('refurbished_co2', 8, 2);
            $table->decimal('transport_co2', 8, 2);
            $table->decimal('net_co2_saved', 8, 2);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('co2_emissions'); }
};
