<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update enum status payments
        DB::statement("ALTER TABLE payments MODIFY COLUMN status ENUM('unpaid','waiting_confirmation','paid','refunded') DEFAULT 'unpaid'");

        // Update enum status bookings
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending','waiting_confirmation','confirmed','cancelled') DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE payments MODIFY COLUMN status ENUM('unpaid','paid','refunded') DEFAULT 'unpaid'");
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending','confirmed','cancelled') DEFAULT 'pending'");
    }
};