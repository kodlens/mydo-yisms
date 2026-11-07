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
        Schema::create('cash_incentive_releases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('cash_incentive_programs')->cascadeOnDelete();
            $table->foreignId('beneficiary_id')->constrained('cash_incentive_beneficiaries')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('status', 30)->default('pending'); // pending, scheduled, released, unclaimed, cancelled
            $table->date('scheduled_release_date')->nullable();
            $table->timestamp('actual_release_date')->nullable();
            $table->string('acknowledgment_reference', 100)->nullable();
            $table->string('supporting_document_path', 255)->nullable();
            $table->foreignId('released_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('acknowledgment_reference');
            $table->index('actual_release_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_incentive_releases');
    }
};
