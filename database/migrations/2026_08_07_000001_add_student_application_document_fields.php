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
            if (! Schema::hasColumn('students', 'previous_semester_gwa')) {
                $table->decimal('previous_semester_gwa', 5, 2)->nullable()->after('year');
            }

            if (! Schema::hasColumn('students', 'coe_path')) {
                $table->string('coe_path')->nullable()->after('monthly_family_income');
            }

            if (! Schema::hasColumn('students', 'cog_path')) {
                $table->string('cog_path')->nullable()->after('coe_path');
            }

            if (! Schema::hasColumn('students', 'cedula_path')) {
                $table->string('cedula_path')->nullable()->after('cog_path');
            }

            if (! Schema::hasColumn('students', 'school_id_path')) {
                $table->string('school_id_path')->nullable()->after('cedula_path');
            }

            if (! Schema::hasColumn('students', 'psa_path')) {
                $table->string('psa_path')->nullable()->after('school_id_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $columns = [
                'previous_semester_gwa',
                'coe_path',
                'cog_path',
                'cedula_path',
                'school_id_path',
                'psa_path',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('students', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
