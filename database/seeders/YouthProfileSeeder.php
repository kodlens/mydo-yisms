<?php

namespace Database\Seeders;

use App\Models\YouthProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class YouthProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'student_id' => '2026-112233',
                'reference_code' => 'YD-2026-0001',
                'lname' => 'Santos',
                'fname' => 'Maria Angela',
                'mname' => 'Reyes',
                'email' => 'grace@mail.com',
                'password' => Hash::make('a'),
                'birth_date' => '2005-04-12',
                'sex' => 'Female',
                'civil_status' => 'Single',
                'mobile_number' => '09171234567',
                'provCode' => 973,
                'citymunCode' => 97308,
                'brgyCode' => 97308034,
                'street_address' => 'Purok 1',
                'zip_code' => '7028',
                'school_name' => 'MYDO State College',
                'program' => 'BS Information Technology',
                'year' => 2,
                'previous_semester_gwa' => 1.75,
                'guardian_name' => 'Ana Santos',
                'guardian_contact_number' => '09181234567',
                'monthly_family_income' => 15000,
                'role' => 'youth',
                'is_active' => true,
                'is_graduated' => false,
            ],
            [
                'student_id' => '2026-2235',
                'reference_code' => 'YD-2026-0002',
                'lname' => 'Garcia',
                'fname' => 'John Michael',
                'mname' => 'Lopez',
                'email' => 'jan@mail.com',
                'password' => Hash::make('a'),
                'birth_date' => '2004-09-25',
                'sex' => 'Male',
                'civil_status' => 'Single',
                'mobile_number' => '09201234567',
                'provCode' => 973,
                'citymunCode' => 97308,
                'brgyCode' => 97308035,
                'street_address' => 'Purok 2',
                'zip_code' => '7028',
                'school_name' => 'Dumingag National High School',
                'program' => 'BS Criminology',
                'year' => 3,
                'previous_semester_gwa' => 2.00,
                'guardian_name' => 'Pedro Garcia',
                'guardian_contact_number' => '09211234567',
                'monthly_family_income' => 18000,
                'role' => 'youth',
                'is_active' => true,
                'is_graduated' => false,
            ],
            [
                'student_id' => '2026-1164',
                'reference_code' => 'YD-2026-0003',
                'lname' => 'Mendoza',
                'fname' => 'Christine Joy',
                'mname' => 'Villanueva',
                'email' => 'tin@mail.com',
                'password' => Hash::make('a'),
                'birth_date' => '2006-01-18',
                'sex' => 'Female',
                'civil_status' => 'Single',
                'mobile_number' => '09301234567',
                'provCode' => 973,
                'citymunCode' => 97308,
                'brgyCode' => 97308003,
                'street_address' => 'Purok 3',
                'zip_code' => '7028',
                'school_name' => 'Dumingag Technological Training School',
                'program' => 'BS Education',
                'year' => 1,
                'previous_semester_gwa' => 1.50,
                'guardian_name' => 'Lorna Mendoza',
                'guardian_contact_number' => '09311234567',
                'monthly_family_income' => 12000,
                'role' => 'youth',
                'is_active' => true,
                'is_graduated' => false,
            ],
        ];

        foreach ($data as $profileData) {
            YouthProfile::updateOrCreate(
                ['email' => $profileData['email']],
                $profileData
            );
        }

        // Ensure any other existing youth profiles without a reference code get one generated
        YouthProfile::whereNull('reference_code')
            ->orWhere('reference_code', '')
            ->each(function (YouthProfile $profile) {
                $profile->reference_code = YouthProfile::generateUniqueReferenceCode();
                $profile->save();
            });
    }
}
