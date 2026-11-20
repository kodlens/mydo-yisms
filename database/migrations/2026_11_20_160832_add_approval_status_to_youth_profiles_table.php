<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('youth_profiles', function (Blueprint $table) {
            $table->string('status', 30)->default('pending')->after('role');
            $table->foreignId('approved_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('rejection_reason')->nullable()->after('approved_at');

            $table->index('status');
        });

        // Backfill existing youth profiles so they remain accessible as approved accounts
        DB::table('youth_profiles')
            ->whereNull('status')
            ->orWhere('status', 'pending')
            ->update([
                'status' => 'approved',
                'is_active' => true,
                'approved_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('youth_profiles', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropIndex(['status']);
            $table->dropColumn(['status', 'approved_by', 'approved_at', 'rejection_reason']);
        });
    }
};
