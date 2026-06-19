<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('proof_image')->nullable()->after('transaction_id');
            $table->timestamp('proof_uploaded_at')->nullable()->after('proof_image');
            $table->decimal('transferred_amount', 10, 2)->nullable()->after('proof_uploaded_at');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'proof_image',
                'proof_uploaded_at',
                'transferred_amount',
            ]);
        });
    }
};