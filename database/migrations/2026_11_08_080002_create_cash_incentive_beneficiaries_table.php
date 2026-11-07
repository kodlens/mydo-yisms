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
        Schema::create('cash_incentive_beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('cash_incentive_programs')->cascadeOnDelete();
            $table->foreignId('youth_profile_id')->constrained('youth_profiles')->cascadeOnDelete();
            $table->string('status', 30)->default('pending'); // pending, approved, rejected
            $table->foreignId('selected_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('selected_at')->useCurrent();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('remarks')->nullable();

            // Historical snapshot fields for accurate reporting even if youth profile changes later
            $table->string('historical_brgy_code', 50)->nullable();
            $table->string('historical_brgy_name', 150)->nullable();
            $table->string('historical_school_name', 255)->nullable();
            $table->string('historical_program', 255)->nullable();
            $table->unsignedTinyInteger('historical_year_level')->nullable();
            $table->boolean('historical_is_graduated')->default(false);
            $table->string('historical_educational_status', 50)->nullable(); // e.g. '1st Year', 'Graduated', 'Out of School'

            $table->timestamps();

            $table->unique(['program_id', 'youth_profile_id'], 'unique_program_youth_beneficiary');
            $table->index('status');
            $table->index('historical_brgy_code');
            $table->index('historical_educational_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_incentive_beneficiaries');
    }
};
