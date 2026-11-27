<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sk_activity_evidences', function (Blueprint $table) {
            $table->foreignId('youth_profile_id')->nullable()->change();
            $table->foreignId('user_id')->nullable()->after('youth_profile_id')->constrained('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sk_activity_evidences', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
