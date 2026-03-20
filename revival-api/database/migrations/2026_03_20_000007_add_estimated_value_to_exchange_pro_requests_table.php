<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('exchange_pro_requests', function (Blueprint $table) {
            $table->decimal('estimated_value', 10, 2)->nullable()->after('description');
        });
    }
    public function down(): void {
        Schema::table('exchange_pro_requests', function (Blueprint $table) {
            $table->dropColumn('estimated_value');
        });
    }
};
