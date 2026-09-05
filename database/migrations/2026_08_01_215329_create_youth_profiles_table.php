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
        Schema::create('youth_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('student_id', 30)->nullable();
            $table->string('lname', 100);
            $table->string('fname', 100)->nullable();
            $table->string('mname', 100)->nullable();
            $table->string('suffix', 30)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('sex', 20)->nullable();
            $table->string('civil_status', 30)->nullable();
            $table->string('mobile_number', 30)->nullable();

            $table->string('provCode', 50)->nullable();
            $table->string('citymunCode', 50)->nullable();
            $table->string('brgyCode', 50)->nullable();
            $table->string('street_address', 255)->nullable();
            $table->string('zip_code', 10)->nullable();

            $table->string('school_name')->nullable();
            $table->string('school_address')->nullable();
            $table->string('program')->nullable();
            $table->unsignedTinyInteger('year')->nullable();
            $table->decimal('previous_semester_gwa', 5, 2)->nullable();

            $table->string('guardian_name')->nullable();
            $table->string('guardian_contact_number', 30)->nullable();
            $table->decimal('monthly_family_income', 10, 2)->nullable();

            $table->string('coe_path')->nullable();
            $table->string('cog_path')->nullable();
            $table->string('cedula_path')->nullable();
            $table->string('school_id_path')->nullable();
            $table->string('psa_path')->nullable();

            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role', 30)->default('youth');

            $table->boolean('is_active')->default(true);

            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('youth_profiles');
    }
};
