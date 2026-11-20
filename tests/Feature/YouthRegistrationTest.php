<?php

namespace Tests\Feature;

use App\Models\Barangay;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class YouthRegistrationTest extends TestCase
{
    use DatabaseTransactions;

    protected Barangay $barangay;

    protected function setUp(): void
    {
        parent::setUp();

        $this->barangay = Barangay::first();
    }

    public function test_youth_registration_page_can_be_rendered(): void
    {
        $response = $this->get(route('youth-register.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('auth/youth/youth-register-page'));
    }

    public function test_youth_aged_15_can_register_with_education_details(): void
    {
        $birthDate = now()->subYears(15)->subDays(10)->toDateString();

        $payload = [
            'email' => 'student15@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'lname' => 'Dela Cruz',
            'fname' => 'Juan',
            'mname' => 'Santos',
            'suffix' => 'Jr.',
            'birth_date' => $birthDate,
            'sex' => 'Male',
            'civil_status' => 'Single',
            'mobile_number' => '09123456789',
            'provCode' => $this->barangay->provCode,
            'citymunCode' => $this->barangay->citymunCode,
            'brgyCode' => $this->barangay->brgyCode,
            'street_address' => 'Purok 2, Main Street',
            'zip_code' => '8712',
            'school_name' => 'Bukidnon State University',
            'school_address' => 'Malaybalay City',
            'program' => 'BS Information Technology',
            'year' => 1,
            'student_id' => 'BSIT-2024-001',
            'is_graduated' => false,
            'guardian_name' => 'Maria Santos Dela Cruz',
            'guardian_contact_number' => '09987654321',
            'monthly_family_income' => 12500,
        ];

        $response = $this->postJson(route('youth-register.store'), $payload);

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('youth_profiles', [
            'email' => 'student15@example.com',
            'school_name' => 'Bukidnon State University',
            'program' => 'BS Information Technology',
            'year' => 1,
            'student_id' => 'BSIT-2024-001',
            'status' => 'pending',
            'is_active' => false,
        ]);

        $youth = YouthProfile::where('email', 'student15@example.com')->first();
        $this->assertNotNull($youth->reference_code);
        $this->assertStringStartsWith('YD-', $youth->reference_code);
    }

    public function test_youth_under_15_cannot_register(): void
    {
        $tooYoungDate = now()->subYears(14)->toDateString();

        $payload = [
            'email' => 'tooyoung@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'lname' => 'Batang',
            'fname' => 'Bata',
            'birth_date' => $tooYoungDate,
            'sex' => 'Male',
            'civil_status' => 'Single',
            'mobile_number' => '09123456789',
            'provCode' => $this->barangay->provCode,
            'citymunCode' => $this->barangay->citymunCode,
            'brgyCode' => $this->barangay->brgyCode,
            'street_address' => 'Purok 1',
            'guardian_name' => 'Nanay Batang',
            'guardian_contact_number' => '09987654321',
            'monthly_family_income' => 5000,
        ];

        $response = $this->postJson(route('youth-register.store'), $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['birth_date']);
    }

    public function test_mobile_number_with_country_code_is_normalized_to_09(): void
    {
        $birthDate = now()->subYears(20)->toDateString();

        $payload = [
            'email' => 'phonetest@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'lname' => 'Reyes',
            'fname' => 'Ana',
            'birth_date' => $birthDate,
            'sex' => 'Female',
            'civil_status' => 'Single',
            'mobile_number' => '+639171234567',
            'provCode' => $this->barangay->provCode,
            'citymunCode' => $this->barangay->citymunCode,
            'brgyCode' => $this->barangay->brgyCode,
            'street_address' => 'Purok 3',
            'school_name' => 'Bukidnon State University',
            'program' => 'BS Information Technology',
            'year' => 2,
            'guardian_name' => 'Jose Reyes',
            'guardian_contact_number' => '+639189876543',
            'monthly_family_income' => 8000,
        ];

        $response = $this->postJson(route('youth-register.store'), $payload);

        $response->assertOk();

        $this->assertDatabaseHas('youth_profiles', [
            'email' => 'phonetest@example.com',
            'mobile_number' => '09171234567',
            'guardian_contact_number' => '09189876543',
        ]);
    }

    public function test_college_details_are_required_for_registration(): void
    {
        $birthDate = now()->subYears(22)->toDateString();

        $payload = [
            'email' => 'nocollege@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'lname' => 'Gomez',
            'fname' => 'Pedro',
            'birth_date' => $birthDate,
            'sex' => 'Male',
            'civil_status' => 'Single',
            'mobile_number' => '09201234567',
            'provCode' => $this->barangay->provCode,
            'citymunCode' => $this->barangay->citymunCode,
            'brgyCode' => $this->barangay->brgyCode,
            'street_address' => 'Purok 5',
            'guardian_name' => 'Juana Gomez',
            'guardian_contact_number' => '09219876543',
            'monthly_family_income' => 6000,
        ];

        $response = $this->postJson(route('youth-register.store'), $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['school_name', 'program', 'year']);
    }

    public function test_youth_approval_and_rejection_workflow_and_login_gate(): void
    {
        $staff = User::create([
            'username' => 'staff_' . \Illuminate\Support\Str::random(6),
            'fname' => 'Staff',
            'lname' => 'Reviewer',
            'email' => 'staff_' . \Illuminate\Support\Str::random(6) . '@example.gov.ph',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'is_active' => true,
        ]);

        $birthDate = now()->subYears(18)->toDateString();
        $payload = [
            'email' => 'workflow@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'lname' => 'Penduko',
            'fname' => 'Pedro',
            'birth_date' => $birthDate,
            'sex' => 'Male',
            'civil_status' => 'Single',
            'mobile_number' => '09123456789',
            'provCode' => $this->barangay->provCode,
            'citymunCode' => $this->barangay->citymunCode,
            'brgyCode' => $this->barangay->brgyCode,
            'street_address' => 'Purok 1',
            'school_name' => 'Bukidnon State University',
            'program' => 'BS Information Technology',
            'year' => 2,
            'guardian_name' => 'Nanay Penduko',
            'guardian_contact_number' => '09987654321',
            'monthly_family_income' => 5000,
        ];

        // 1. Youth registers -> status is pending, is_active is false
        $this->postJson(route('youth-register.store'), $payload)->assertOk();
        $youth = YouthProfile::where('email', 'workflow@example.com')->firstOrFail();
        $this->assertEquals('pending', $youth->status);
        $this->assertFalse((bool) $youth->is_active);

        // 2. Pending youth tries to login -> 403 Forbidden with pending status
        $loginResponse = $this->postJson(route('youth-login.login'), [
            'email' => 'workflow@example.com',
            'password' => 'Password123!',
        ]);
        $loginResponse->assertStatus(403);
        $loginResponse->assertJson(['status' => 'pending']);

        // 3. Staff rejects youth profile with reason
        $this->actingAs($staff, 'web')
            ->postJson(route('staff.youth-profiles.reject', $youth->id), [
                'rejection_reason' => 'Incomplete or unreadable ID card.',
            ])
            ->assertOk();

        $youth->refresh();
        $this->assertEquals('rejected', $youth->status);
        $this->assertEquals('Incomplete or unreadable ID card.', $youth->rejection_reason);
        $this->assertFalse((bool) $youth->is_active);

        // 4. Rejected youth tries to login -> 403 with rejection reason
        $this->postJson(route('youth-login.login'), [
            'email' => 'workflow@example.com',
            'password' => 'Password123!',
        ])->assertStatus(403)->assertJson([
            'status' => 'rejected',
            'rejection_reason' => 'Incomplete or unreadable ID card.',
        ]);

        // 5. Staff approves the youth profile
        $this->actingAs($staff, 'web')
            ->postJson(route('staff.youth-profiles.approve', $youth->id))
            ->assertOk();

        $youth->refresh();
        $this->assertEquals('approved', $youth->status);
        $this->assertTrue((bool) $youth->is_active);
        $this->assertEquals($staff->id, $youth->approved_by);
        $this->assertNotNull($youth->approved_at);

        // 6. Approved youth can now log in successfully
        $this->postJson(route('youth-login.login'), [
            'email' => 'workflow@example.com',
            'password' => 'Password123!',
        ])->assertOk()->assertJson([
            'success' => true,
        ]);
    }
}
