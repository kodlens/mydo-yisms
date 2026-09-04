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
        Schema::create('youth_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->nullable()->constrained('students')->nullOnDelete();
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
            $table->decimal('previous_semester_gwa', 5, 2)->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_contact_number', 30)->nullable();
            $table->decimal('monthly_family_income', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['provCode', 'citymunCode', 'brgyCode']);
        });

        Schema::create('scholarship_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('youth_profile_id')->constrained('youth_profiles')->cascadeOnDelete();
            $table->string('status', 30)->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('scholarship_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scholarship_application_id')->constrained('scholarship_applications')->cascadeOnDelete();
            $table->string('type', 50);
            $table->string('path')->nullable();
            $table->string('status', 30)->default('submitted');
            $table->timestamps();

            $table->unique(['scholarship_application_id', 'type']);
        });

        $this->backfillFromStudents();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarship_documents');
        Schema::dropIfExists('scholarship_applications');
        Schema::dropIfExists('youth_profiles');
    }

    private function backfillFromStudents(): void
    {
        $hasRejectionReason = Schema::hasColumn('students', 'rejection_reason');

        DB::table('students')->orderBy('id')->each(function ($student) use ($hasRejectionReason) {
            $profileId = DB::table('youth_profiles')->insertGetId([
                'student_id' => $student->id,
                'lname' => $student->lname,
                'fname' => $student->fname,
                'mname' => $student->mname,
                'suffix' => $student->suffix,
                'birth_date' => $student->birth_date,
                'sex' => $student->sex,
                'civil_status' => $student->civil_status,
                'mobile_number' => $student->mobile_number,
                'provCode' => $student->provCode,
                'citymunCode' => $student->citymunCode,
                'brgyCode' => $student->brgyCode,
                'street_address' => $student->street_address,
                'zip_code' => $student->zip_code,
                'school_name' => $student->school_name,
                'program' => $student->program,
                'year' => $student->year,
                'previous_semester_gwa' => $student->previous_semester_gwa,
                'guardian_name' => $student->guardian_name,
                'guardian_contact_number' => $student->guardian_contact_number,
                'monthly_family_income' => $student->monthly_family_income,
                'is_active' => $student->is_active,
                'created_at' => $student->created_at,
                'updated_at' => $student->updated_at,
            ]);

            $applicationId = DB::table('scholarship_applications')->insertGetId([
                'youth_profile_id' => $profileId,
                'status' => $student->registration_status ?? 'pending',
                'rejection_reason' => $hasRejectionReason ? $student->rejection_reason : null,
                'submitted_at' => $student->created_at,
                'created_at' => $student->created_at,
                'updated_at' => $student->updated_at,
            ]);

            foreach ([
                'coe' => $student->coe_path,
                'cog' => $student->cog_path,
                'cedula' => $student->cedula_path,
                'school_id' => $student->school_id_path,
                'psa' => $student->psa_path,
            ] as $type => $path) {
                if ($path === null || $path === '') {
                    continue;
                }

                DB::table('scholarship_documents')->insert([
                    'scholarship_application_id' => $applicationId,
                    'type' => $type,
                    'path' => $path,
                    'status' => 'submitted',
                    'created_at' => $student->created_at,
                    'updated_at' => $student->updated_at,
                ]);
            }
        });
    }
};
