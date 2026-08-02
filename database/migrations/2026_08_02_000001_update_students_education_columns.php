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
        Schema::table('students', function (Blueprint $table) {
            if (! Schema::hasColumn('students', 'program')) {
                $table->string('program')->nullable()->after('school_name');
            }

            if (! Schema::hasColumn('students', 'year')) {
                $table->unsignedTinyInteger('year')->nullable()->after('program');
            }
        });

        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'school_level')) {
                $table->dropColumn('school_level');
            }

            if (Schema::hasColumn('students', 'year_level')) {
                $table->dropColumn('year_level');
            }

            if (Schema::hasColumn('students', 'course')) {
                $table->dropColumn('course');
            }

            if (Schema::hasColumn('students', 'gwa')) {
                $table->dropColumn('gwa');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (! Schema::hasColumn('students', 'school_level')) {
                $table->string('school_level', 50)->nullable()->after('school_name');
            }

            if (! Schema::hasColumn('students', 'year_level')) {
                $table->string('year_level', 50)->nullable()->after('school_level');
            }

            if (! Schema::hasColumn('students', 'course')) {
                $table->string('course')->nullable()->after('year_level');
            }

            if (! Schema::hasColumn('students', 'gwa')) {
                $table->decimal('gwa', 5, 2)->nullable()->after('course');
            }
        });

        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'program')) {
                $table->dropColumn('program');
            }

            if (Schema::hasColumn('students', 'year')) {
                $table->dropColumn('year');
            }
        });
    }
};
