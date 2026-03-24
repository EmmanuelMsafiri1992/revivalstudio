<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resale_factors', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['age', 'condition', 'brand']);
            $table->string('key', 50);
            $table->string('name', 100);
            $table->decimal('factor', 5, 2);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->unique(['type', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resale_factors');
    }
};
