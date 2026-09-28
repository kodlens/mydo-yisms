<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A volunteer is a youth profile that opted into community service. Keeping it as a
     * separate table (rather than a flag on youth_profiles) lets us keep the volunteer
     * program alive independently of a youth's general record.
     */
    public function up(): void
    {
        Schema::create('volunteers', function (Blueprint $table) {
            $table->id();

            // One volunteer record per youth. The youth row owns the personal details.
            $table->foreignId('youth_profile_id')->unique()->constrained('youth_profiles')->cascadeOnDelete();

            // pending, active, inactive. Youth self-register as pending; staff approve.
            $table->string('status', 30)->default('pending');

            $table->text('motivation')->nullable();
            $table->string('skills', 255)->nullable();
            $table->string('availability', 255)->nullable();

            $table->string('emergency_contact_name', 100)->nullable();
            $table->string('emergency_contact_number', 30)->nullable();

            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->dateTime('registered_at')->useCurrent();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteers');
    }
};
