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
        Schema::create('scholarship_types', function (Blueprint $table) {
            $table->id();
            $table->string('scholarship', 255)->unique();
            $table->string('target_beneficiary', 255)->nullable();
            $table->string('benefit', 255)->nullable();
            $table->decimal('amount', 12,2)->default();
            $table->boolean('is_active')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarship_types');
    }
};
