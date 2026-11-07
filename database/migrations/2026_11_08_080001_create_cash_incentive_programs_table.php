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
        Schema::create('cash_incentive_programs', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('funding_year');
            $table->decimal('amount_per_beneficiary', 10, 2);
            $table->decimal('allocated_budget', 12, 2);
            $table->unsignedInteger('max_beneficiaries');
            $table->date('selection_start_date')->nullable();
            $table->date('selection_end_date')->nullable();
            $table->date('release_start_date')->nullable();
            $table->date('release_end_date')->nullable();
            $table->string('status', 30)->default('draft');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('funding_year');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_incentive_programs');
    }
};
