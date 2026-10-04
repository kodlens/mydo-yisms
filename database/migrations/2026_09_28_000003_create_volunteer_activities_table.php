<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Links a volunteer to an activity they were assigned to. This is separate from
     * activity_registrations because attendance and credited service hours hang off
     * the assignment, and volunteer records must outlive ordinary event sign-ups.
     */
    public function up(): void
    {
        Schema::create('volunteer_activities', function (Blueprint $table) {
            $table->id();

            // Preserve service history; volunteers and activities are archived, not deleted.
            $table->foreignId('volunteer_id')->constrained('volunteers')->restrictOnDelete();
            $table->foreignId('activity_id')->constrained('activities')->restrictOnDelete();

            $table->string('role', 100)->nullable();

            // assigned, completed, cancelled.
            $table->string('status', 30)->default('assigned');

            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('assigned_at')->useCurrent();
            $table->timestamps();

            // Re-assigning the same volunteer to the same activity updates the row.
            $table->unique(['volunteer_id', 'activity_id']);
            $table->index(['activity_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteer_activities');
    }
};
