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
        Schema::table('students', function (Blueprint $table) {
            if (! Schema::hasColumn('students', 'provCode')) {
                $table->string('provCode')->nullable()->after('mobile_number');
            }

            if (! Schema::hasColumn('students', 'citymunCode')) {
                $table->string('citymunCode')->nullable()->after('provCode');
            }

            if (! Schema::hasColumn('students', 'brgyCode')) {
                $table->string('brgyCode')->nullable()->after('citymunCode');
            }
        });

        if (Schema::hasColumn('students', 'province_id')) {
            DB::table('students')
                ->leftJoin('provinces', 'students.province_id', '=', 'provinces.id')
                ->whereNotNull('students.province_id')
                ->update(['students.provCode' => DB::raw('provinces.provCode')]);
        }

        if (Schema::hasColumn('students', 'city_id')) {
            DB::table('students')
                ->leftJoin('cities', 'students.city_id', '=', 'cities.id')
                ->whereNotNull('students.city_id')
                ->update(['students.citymunCode' => DB::raw('cities.citymunCode')]);
        }

        if (Schema::hasColumn('students', 'barangay_id')) {
            DB::table('students')
                ->leftJoin('barangays', 'students.barangay_id', '=', 'barangays.id')
                ->whereNotNull('students.barangay_id')
                ->update(['students.brgyCode' => DB::raw('barangays.brgyCode')]);
        }

        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'province_id')) {
                $table->dropColumn('province_id');
            }

            if (Schema::hasColumn('students', 'city_id')) {
                $table->dropColumn('city_id');
            }

            if (Schema::hasColumn('students', 'barangay_id')) {
                $table->dropColumn('barangay_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (! Schema::hasColumn('students', 'province_id')) {
                $table->foreignId('province_id')->nullable()->after('mobile_number');
            }

            if (! Schema::hasColumn('students', 'city_id')) {
                $table->foreignId('city_id')->nullable()->after('province_id');
            }

            if (! Schema::hasColumn('students', 'barangay_id')) {
                $table->foreignId('barangay_id')->nullable()->after('city_id');
            }
        });

        if (Schema::hasColumn('students', 'provCode')) {
            DB::table('students')
                ->leftJoin('provinces', 'students.provCode', '=', 'provinces.provCode')
                ->whereNotNull('students.provCode')
                ->update(['students.province_id' => DB::raw('provinces.id')]);
        }

        if (Schema::hasColumn('students', 'citymunCode')) {
            DB::table('students')
                ->leftJoin('cities', 'students.citymunCode', '=', 'cities.citymunCode')
                ->whereNotNull('students.citymunCode')
                ->update(['students.city_id' => DB::raw('cities.id')]);
        }

        if (Schema::hasColumn('students', 'brgyCode')) {
            DB::table('students')
                ->leftJoin('barangays', 'students.brgyCode', '=', 'barangays.brgyCode')
                ->whereNotNull('students.brgyCode')
                ->update(['students.barangay_id' => DB::raw('barangays.id')]);
        }

        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'provCode')) {
                $table->dropColumn('provCode');
            }

            if (Schema::hasColumn('students', 'citymunCode')) {
                $table->dropColumn('citymunCode');
            }

            if (Schema::hasColumn('students', 'brgyCode')) {
                $table->dropColumn('brgyCode');
            }
        });
    }
};
