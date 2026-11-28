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
        Schema::table('users', function (Blueprint $table) {
            $table->string('sk_position', 100)->nullable()->after('role');
            $table->string('provCode', 50)->nullable()->after('sk_position');
            $table->string('citymunCode', 50)->nullable()->after('provCode');
            $table->string('brgyCode', 50)->nullable()->index()->after('citymunCode');
            $table->string('street_address', 255)->nullable()->after('brgyCode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['brgyCode']);
            $table->dropColumn([
                'sk_position',
                'provCode',
                'citymunCode',
                'brgyCode',
                'street_address',
            ]);
        });
    }
};
