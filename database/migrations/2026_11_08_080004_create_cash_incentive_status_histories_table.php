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
        Schema::create('cash_incentive_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('cash_incentive_programs')->cascadeOnDelete();
            $table->foreignId('beneficiary_id')->constrained('cash_incentive_beneficiaries')->cascadeOnDelete();
            $table->foreignId('release_id')->nullable()->constrained('cash_incentive_releases')->cascadeOnDelete();
            $table->string('from_status', 50)->nullable();
            $table->string('to_status', 50);
            $table->string('action_type', 50); // selected, approved, rejected, release_scheduled, cash_released, marked_unclaimed, release_cancelled
            $table->text('reason')->nullable();
            $table->json('metadata')->nullable();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_name', 150)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['program_id', 'created_at']);
            $table->index(['beneficiary_id', 'created_at']);
            $table->index('action_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_incentive_status_histories');
    }
};
