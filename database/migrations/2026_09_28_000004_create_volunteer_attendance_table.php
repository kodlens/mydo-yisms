<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One attendance record per volunteer assignment. hours_rendered is the value that
     * counts towards the volunteer's service hours; it is derived from time_in/time_out
     * when staff log a manual entry, and may be set directly for a QR scan.
     */
    public function up(): void
    {
        Schema::create('volunteer_attendance', function (Blueprint $table) {
            $table->id();

            $table->foreignId('volunteer_activity_id')->constrained('volunteer_activities')->cascadeOnDelete();

            $table->dateTime('time_in')->nullable();
            $table->dateTime('time_out')->nullable();

            // Credited service hours, capped by validation at 24 per record.
            $table->decimal('hours_rendered', 6, 2)->nullable();

            // manual, qr.
            $table->string('method', 20)->default('manual');

            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('remarks', 255)->nullable();
            $table->timestamps();

            // Logging attendance again edits the existing record instead of duplicating it.
            $table->unique('volunteer_activity_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteer_attendance');
    }
};
