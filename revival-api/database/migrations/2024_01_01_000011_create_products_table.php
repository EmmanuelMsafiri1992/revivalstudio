<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add location fields to outlets table (only if they don't exist)
        if (!Schema::hasColumn('outlets', 'city')) {
            Schema::table('outlets', function (Blueprint $table) {
                $table->string('city')->nullable()->after('address');
            });
        }
        if (!Schema::hasColumn('outlets', 'postcode')) {
            Schema::table('outlets', function (Blueprint $table) {
                $table->string('postcode')->nullable();
            });
        }
        if (!Schema::hasColumn('outlets', 'latitude')) {
            Schema::table('outlets', function (Blueprint $table) {
                $table->decimal('latitude', 10, 8)->nullable();
            });
        }
        if (!Schema::hasColumn('outlets', 'longitude')) {
            Schema::table('outlets', function (Blueprint $table) {
                $table->decimal('longitude', 11, 8)->nullable();
            });
        }
        if (!Schema::hasColumn('outlets', 'description')) {
            Schema::table('outlets', function (Blueprint $table) {
                $table->text('description')->nullable();
            });
        }
        if (!Schema::hasColumn('outlets', 'opening_hours')) {
            Schema::table('outlets', function (Blueprint $table) {
                $table->json('opening_hours')->nullable();
            });
        }

        // Create products table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->constrained()->onDelete('cascade');
            $table->foreignId('furniture_type_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('original_price', 10, 2)->nullable();
            $table->string('condition')->default('good'); // excellent, good, fair, poor
            $table->string('brand')->nullable();
            $table->string('material')->nullable();
            $table->string('dimensions')->nullable();
            $table->string('color')->nullable();
            $table->integer('quantity')->default(1);
            $table->json('images')->nullable();
            $table->enum('status', ['available', 'reserved', 'sold', 'draft'])->default('available');
            $table->boolean('featured')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');

        Schema::table('outlets', function (Blueprint $table) {
            $table->dropColumn(['address', 'city', 'postcode', 'latitude', 'longitude', 'description', 'opening_hours']);
        });
    }
};
