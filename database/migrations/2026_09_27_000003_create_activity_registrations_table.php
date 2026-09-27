<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_registrations', function (Blueprint $table) {
            $table->id();
            // Preserve participation history; archive activities instead of deleting them.
            $table->foreignId('activity_id')->constrained('activities')->restrictOnDelete();
            $table->foreignId('youth_profile_id')->constrained('youth_profiles')->restrictOnDelete();

            // pending, approved, rejected, cancelled. Only pending/approved reserve a slot.
            $table->string('status', 30)->default('pending');
            $table->dateTime('registered_at')->useCurrent();
            $table->dateTime('cancelled_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            // Re-registration updates the existing row rather than creating a duplicate.
            $table->unique(['activity_id', 'youth_profile_id']);
            $table->index(['activity_id', 'status']);
            $table->index(['youth_profile_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_registrations');
    }
};
