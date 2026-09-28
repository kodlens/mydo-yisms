<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The column was declared as `decimal(12,2)->default()`, which MySQL turned into
     * `NOT NULL DEFAULT 1.00`. Saving a scholarship without an amount therefore
     * stored 1.00 instead of leaving it unset.
     */
    public function up(): void
    {
        Schema::table('scholarship_types', function (Blueprint $table) {
            $table->decimal('amount', 12, 2)->nullable()->default(null)->change();
        });
    }

    public function down(): void
    {
        Schema::table('scholarship_types', function (Blueprint $table) {
            $table->decimal('amount', 12, 2)->default(0)->change();
        });
    }
};
