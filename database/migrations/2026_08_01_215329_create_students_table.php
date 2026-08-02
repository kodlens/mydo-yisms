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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('lname');
            $table->string('fname')->nullable();
            $table->string('mname')->nullable();
            $table->string('suffix', 30)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('sex', 20)->nullable();
            $table->string('civil_status', 30)->nullable();
            $table->string('mobile_number', 30)->nullable();

            $table->string('provCode')->nullable();
            $table->string('citymunCode')->nullable();
            $table->string('brgyCode')->nullable();
            $table->string('street_address')->nullable();
            $table->string('zip_code', 10)->nullable();

            $table->string('school_name')->nullable();
            $table->string('program')->nullable();
            $table->unsignedTinyInteger('year')->nullable();

            $table->string('guardian_name')->nullable();
            $table->string('guardian_contact_number', 30)->nullable();
            $table->decimal('monthly_family_income', 10, 2)->nullable();

            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role', 30)->default('student');
            $table->string('registration_status', 30)->default('draft');
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
        Schema::dropIfExists('students');
    }
};
