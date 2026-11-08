<?php

namespace Tests\Feature;

use App\Models\Barangay;
use App\Models\City;
use App\Models\Province;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class YouthProfileManagementTest extends TestCase
{
    protected YouthProfile $youth;
    protected User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $barangay = Barangay::first();
        $city = City::first();
        $province = Province::first();

        $this->youth = YouthProfile::create([
            'email' => 'youth_profile_test_' . uniqid() . '@example.com',
            'fname' => 'Juan',
            'lname' => 'Dela Cruz',
            'mname' => 'Santos',
            'sex' => 'Male',
            'civil_status' => 'Single',
            'birth_date' => '2004-05-15',
            'mobile_number' => '09171234567',
            'provCode' => $province?->provCode ?? '0128',
            'citymunCode' => $city?->citymunCode ?? '012801',
            'brgyCode' => $barangay?->brgyCode ?? '012801001',
            'street_address' => '123 Rizal St',
            'zip_code' => '1000',
            'school_name' => 'University of the East',
            'school_address' => 'Manila City',
            'program' => 'BS Information Technology',
            'year' => 2,
            'student_id' => '2023-00123',
            'previous_semester_gwa' => 1.75,
            'guardian_name' => 'Maria Dela Cruz',
            'guardian_contact_number' => '09181234567',
            'monthly_family_income' => 25000,
            'password' => Hash::make('password123'),
            'role' => 'youth',
            'is_active' => true,
            'is_graduated' => false,
        ]);

        $this->staff = User::create([
            'fname' => 'Staff',
            'lname' => 'User',
            'mname' => 'S',
            'sex' => 'Female',
            'username' => 'staff_' . uniqid(),
            'email' => 'staff_' . uniqid() . '@example.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
        ]);
    }

    public function test_youth_can_view_my_profile(): void
    {
        $response = $this->actingAs($this->youth, 'youth')
            ->get('/youth/my-profile');

        $response->assertStatus(200);
    }

    public function test_youth_can_update_profile(): void
    {
        $payload = [
            'mobile_number' => '09228889999',
            'educational_status' => 'enrolled',
            'school_name' => 'Polytechnic University of the Philippines',
            'school_address' => 'Sta. Mesa, Manila',
            'program' => 'BS Computer Science',
            'year' => 3,
            'student_id' => 'PUP-2023-999',
            'guardian_name' => 'Pedro Dela Cruz',
            'guardian_contact_number' => '09199998888',
            'monthly_family_income' => 30000,
        ];

        $response = $this->actingAs($this->youth, 'youth')
            ->put('/youth/my-profile', $payload);

        $response->assertRedirect('/youth/my-profile');

        $this->youth->refresh();
        $this->assertEquals('09228889999', $this->youth->mobile_number);
        $this->assertEquals('Polytechnic University of the Philippines', $this->youth->school_name);
        $this->assertEquals('BS Computer Science', $this->youth->program);
        $this->assertEquals(3, $this->youth->year);
        $this->assertEquals('Pedro Dela Cruz', $this->youth->guardian_name);
    }

    public function test_staff_can_view_and_fetch_youth_profiles(): void
    {
        $response = $this->actingAs($this->staff)
            ->get('/staff/get-youth-profiles');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data',
            'current_page',
            'total',
        ]);
    }

    public function test_staff_can_filter_youth_profiles_by_status(): void
    {
        $response = $this->actingAs($this->staff)
            ->get('/staff/get-youth-profiles?status=enrolled');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertNotEmpty($data);
    }
}
