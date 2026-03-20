<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exchange_pro_requests', function (Blueprint $table) {
            $table->json('photos')->nullable()->after('description');
        });

        Schema::table('bidding_pro_requests', function (Blueprint $table) {
            $table->json('photos')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('exchange_pro_requests', function (Blueprint $table) {
            $table->dropColumn('photos');
        });
        Schema::table('bidding_pro_requests', function (Blueprint $table) {
            $table->dropColumn('photos');
        });
    }
};
