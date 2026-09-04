<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'lname' => 'Santos',
                'fname' => 'Maria Angela',
                'mname' => 'Reyes',
                'email' => 'maria.santos@example.com',
                'password' => Hash::make('a'),
                'birth_date' => '2005-04-12',
                'sex' => 'Female',
                'civil_status' => 'Single',
                'mobile_number' => '09171234567',
                'street_address' => 'Purok 1',
                'school_name' => 'MYDO State College',
                'program' => 'BS Information Technology',
                'year' => 2,
                'previous_semester_gwa' => 1.75,
                'guardian_name' => 'Ana Santos',
                'guardian_contact_number' => '09181234567',
                'monthly_family_income' => 15000,
                'role' => 'student',
                'registration_status' => 'pending',
                'is_active' => true,
            ],
            [
                'lname' => 'Garcia',
                'fname' => 'John Michael',
                'mname' => 'Lopez',
                'email' => 'john.garcia@example.com',
                'password' => Hash::make('a'),
                'birth_date' => '2004-09-25',
                'sex' => 'Male',
                'civil_status' => 'Single',
                'mobile_number' => '09201234567',
                'street_address' => 'Purok 2',
                'school_name' => 'MYDO State College',
                'program' => 'BS Criminology',
                'year' => 3,
                'previous_semester_gwa' => 2.00,
                'guardian_name' => 'Pedro Garcia',
                'guardian_contact_number' => '09211234567',
                'monthly_family_income' => 18000,
                'role' => 'student',
                'registration_status' => 'pending',
                'is_active' => true,
            ],
            [
                'lname' => 'Mendoza',
                'fname' => 'Christine Joy',
                'mname' => 'Villanueva',
                'email' => 'christine.mendoza@example.com',
                'password' => Hash::make('a'),
                'birth_date' => '2006-01-18',
                'sex' => 'Female',
                'civil_status' => 'Single',
                'mobile_number' => '09301234567',
                'street_address' => 'Purok 3',
                'school_name' => 'MYDO Community College',
                'program' => 'BS Education',
                'year' => 1,
                'previous_semester_gwa' => 1.50,
                'guardian_name' => 'Lorna Mendoza',
                'guardian_contact_number' => '09311234567',
                'monthly_family_income' => 12000,
                'role' => 'student',
                'registration_status' => 'approved',
                'is_active' => true,
            ],
        ];

        Student::insertOrIgnore($data);
    }
}
