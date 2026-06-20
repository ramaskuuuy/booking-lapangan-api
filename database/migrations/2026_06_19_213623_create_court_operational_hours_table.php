<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('court_operational_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('court_id')->constrained('courts')->cascadeOnDelete();
            // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            $table->tinyInteger('day_of_week'); 
            $table->time('open_time')->nullable();
            $table->time('close_time')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();

            // Memastikan satu lapangan tidak memiliki duplikat hari
            $table->unique(['court_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('court_operational_hours');
    }
};
