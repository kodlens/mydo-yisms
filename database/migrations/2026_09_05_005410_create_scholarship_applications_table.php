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
        Schema::create('scholarship_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('youth_profile_id')->constrained('youth_profiles')->cascadeOnDelete();
            $table->foreignId('scholarship_type_id')->constrained('scholarship_types')->cascadeOnDelete();

            $table->string('coe_path')->nullable();
            $table->string('cog_path')->nullable();
            $table->string('cedula_path')->nullable();
            $table->string('school_id_path')->nullable();
            $table->string('psa_path')->nullable();

            $table->string('status', 30)->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarship_applications');
    }
};
