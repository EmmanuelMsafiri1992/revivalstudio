<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('bidding_pro_requests', function (Blueprint $table) {
            $table->decimal('desired_price', 10, 2)->nullable()->after('phone')
                  ->comment('Customer desired selling price');
            $table->string('whatsapp')->nullable()->after('desired_price')
                  ->comment('Customer WhatsApp number for partners to contact');
        });
    }
    public function down(): void {
        Schema::table('bidding_pro_requests', function (Blueprint $table) {
            $table->dropColumn(['desired_price', 'whatsapp']);
        });
    }
};
