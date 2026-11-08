<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipType;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StaffDashboardClickableCardsTest extends TestCase
{
    protected User $staff;
    protected YouthProfile $youth;
    protected ScholarshipType $type;
    protected AcademicYear $year;

    protected function setUp(): void
    {
        parent::setUp();

        $this->staff = User::create([
            'fname' => 'Staff',
            'lname' => 'Member',
            'mname' => 'A',
            'sex' => 'Female',
            'username' => 'staff_' . uniqid(),
            'email' => 'staff_' . uniqid() . '@example.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
        ]);

        $this->youth = YouthProfile::create([
            'email' => 'youth_' . uniqid() . '@example.com',
            'fname' => 'Card',
            'lname' => 'Tester',
            'sex' => 'Male',
            'birth_date' => '2004-01-01',
            'password' => Hash::make('password123'),
            'role' => 'youth',
            'is_active' => true,
        ]);

        $this->type = ScholarshipType::create([
            'scholarship' => 'Dashboard Test Scholarship ' . uniqid(),
            'target_beneficiary' => 'College Students',
            'benefit' => 'Tuition assistance',
            'amount' => 5000,
            'is_active' => true,
        ]);

        $this->year = AcademicYear::firstOrCreate(
            ['is_active' => true],
            ['code' => 'AY2026-2027', 'name' => '2026-2027', 'is_active' => true]
        );
    }

    public function test_staff_dashboard_loads_with_stats(): void
    {
        ScholarshipApplication::create([
            'youth_profile_id' => $this->youth->id,
            'scholarship_type_id' => $this->type->id,
            'academic_year_id' => $this->year->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->staff)->get('/staff/dashboard');

        $response->assertStatus(200);
        $response->assertSee('stats');
    }

    public function test_staff_applicants_page_accepts_status_query(): void
    {
        $response = $this->actingAs($this->staff)->get('/staff/applicants?status=pending');
        $response->assertStatus(200);

        $responseApproved = $this->actingAs($this->staff)->get('/staff/applicants?status=approved');
        $responseApproved->assertStatus(200);
    }

    public function test_get_applicants_filters_by_pending_status(): void
    {
        $pendingApp = ScholarshipApplication::create([
            'youth_profile_id' => $this->youth->id,
            'scholarship_type_id' => $this->type->id,
            'academic_year_id' => $this->year->id,
            'status' => 'pending',
        ]);

        $approvedApp = ScholarshipApplication::create([
            'youth_profile_id' => $this->youth->id,
            'scholarship_type_id' => $this->type->id,
            'academic_year_id' => $this->year->id,
            'status' => 'approved',
        ]);

        $response = $this->actingAs($this->staff)->get('/staff/get-applicants?status=pending');

        $response->assertStatus(200);
        $data = $response->json('data');

        $statuses = collect($data)->pluck('registration_status')->all();
        $this->assertTrue(collect($statuses)->every(fn ($s) => $s === 'pending'));
    }
}
