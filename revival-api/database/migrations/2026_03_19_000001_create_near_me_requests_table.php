<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('near_me_requests', function (Blueprint $table) {
            $table->id();
            $table->string('postcode');
            $table->decimal('distance_miles', 5, 2);
            $table->string('product_name')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('near_me_requests'); }
};
