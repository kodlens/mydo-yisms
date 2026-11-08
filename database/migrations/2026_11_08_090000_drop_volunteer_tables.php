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
        Schema::dropIfExists('volunteer_attendance');
        Schema::dropIfExists('volunteer_activities');
        Schema::dropIfExists('volunteers');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('volunteers')) {
            Schema::create('volunteers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('youth_profile_id')->unique()->constrained('youth_profiles')->cascadeOnDelete();
                $table->string('status', 30)->default('pending');
                $table->text('motivation')->nullable();
                $table->string('skills', 255)->nullable();
                $table->string('availability', 255)->nullable();
                $table->string('emergency_contact_name', 100)->nullable();
                $table->string('emergency_contact_number', 30)->nullable();
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->dateTime('approved_at')->nullable();
                $table->dateTime('registered_at')->useCurrent();
                $table->timestamps();
                $table->index('status');
            });
        }

        if (!Schema::hasTable('volunteer_activities')) {
            Schema::create('volunteer_activities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('volunteer_id')->constrained('volunteers')->restrictOnDelete();
                $table->foreignId('activity_id')->constrained('activities')->restrictOnDelete();
                $table->string('role', 100)->nullable();
                $table->string('status', 30)->default('assigned');
                $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
                $table->dateTime('assigned_at')->useCurrent();
                $table->timestamps();
                $table->unique(['volunteer_id', 'activity_id']);
                $table->index(['activity_id', 'status']);
            });
        }

        if (!Schema::hasTable('volunteer_attendance')) {
            Schema::create('volunteer_attendance', function (Blueprint $table) {
                $table->id();
                $table->foreignId('volunteer_activity_id')->constrained('volunteer_activities')->cascadeOnDelete();
                $table->decimal('hours_rendered', 5, 2)->default(0);
                $table->text('remarks')->nullable();
                $table->foreignId('marked_by')->nullable()->constrained('users')->nullOnDelete();
                $table->dateTime('marked_at')->useCurrent();
                $table->timestamps();
            });
        }
    }
};
