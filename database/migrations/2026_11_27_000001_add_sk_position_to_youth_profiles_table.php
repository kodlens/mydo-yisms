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
        Schema::table('youth_profiles', function (Blueprint $table) {
            $table->string('sk_position', 100)->nullable()->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('youth_profiles', function (Blueprint $table) {
            $table->dropColumn('sk_position');
        });
    }
};
