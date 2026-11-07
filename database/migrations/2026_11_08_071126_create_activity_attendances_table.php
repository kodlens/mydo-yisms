<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activity_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
            $table->foreignId('youth_profile_id')->constrained('youth_profiles')->restrictOnDelete();
            $table->foreignId('activity_registration_id')->constrained('activity_registrations')->cascadeOnDelete();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();

            // 'qr' or 'manual'
            $table->string('method', 20)->default('qr');
            $table->dateTime('attended_at');
            $table->string('remarks', 255)->nullable();
            $table->timestamps();

            // One attendance record per youth per activity
            $table->unique(['activity_id', 'youth_profile_id'], 'activity_youth_attendance_unique');
            $table->index(['activity_id', 'attended_at']);
            $table->index('activity_registration_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_attendances');
    }
};
