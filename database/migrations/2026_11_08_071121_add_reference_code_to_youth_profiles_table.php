<?php

use App\Models\YouthProfile;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('youth_profiles', function (Blueprint $table) {
            $table->string('reference_code', 32)->nullable()->unique()->after('student_id');
        });

        // Backfill existing youth profiles with secure, non-sequential reference identifiers
        YouthProfile::whereNull('reference_code')->chunkById(100, function ($profiles) {
            foreach ($profiles as $profile) {
                do {
                    $code = 'YD-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4));
                } while (YouthProfile::where('reference_code', $code)->exists());

                $profile->update(['reference_code' => $code]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('youth_profiles', function (Blueprint $table) {
            $table->dropColumn('reference_code');
        });
    }
};
