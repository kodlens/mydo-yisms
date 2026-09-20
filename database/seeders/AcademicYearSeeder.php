<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AcademicYearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'code' => '2022-2023',
                'name' => 'Academic Year 2022-2023',
                'is_active' => 0
            ],
            [
                'code' => '2023-2024',
                'name' => 'Academic Year 2023-2024',
                'is_active' => 0
            ],
            [
                'code' => '2024-2025',
                'name' => 'Academic Year 2024-2025',
                'is_active' => 0
            ],
            [
                'code' => '2025-2026',
                'name' => 'Academic Year 2025-2026',
                'is_active' => 1
            ],
            [
                'code' => '2026-2027',
                'name' => 'Academic Year 2026-2027',
                'is_active' => 0
            ],

        ];

        \App\Models\AcademicYear::insertOrIgnore($data);
    }
}
