<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Barangay;
use App\Models\City;
use App\Models\Province;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipType;
use App\Models\YouthProfile;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class YouthDashboardTest extends TestCase
{
    use DatabaseTransactions;

    protected YouthProfile $youth;

    protected function setUp(): void
    {
        parent::setUp();

        $barangay = Barangay::first();
        $city = City::first();
        $province = Province::first();

        $this->youth = YouthProfile::create([
            'email' => 'youth_dash_' . uniqid() . '@example.com',
            'fname' => 'Dashboard',
            'lname' => 'Student',
            'mname' => 'T',
            'sex' => 'Male',
            'civil_status' => 'Single',
            'birth_date' => '2003-01-01',
            'mobile_number' => '09171234567',
            'provCode' => $province?->provCode ?? '973',
            'citymunCode' => $city?->citymunCode ?? '97308',
            'brgyCode' => $barangay?->brgyCode ?? '97308035',
            'street_address' => 'Purok 1',
            'school_name' => 'Bukidnon State University',
            'program' => 'BS Information Technology',
            'year' => 2,
            'guardian_name' => 'Guardian Name',
            'guardian_contact_number' => '09181234567',
            'monthly_family_income' => 15000,
            'password' => Hash::make('password123'),
            'role' => 'youth',
            'is_active' => true,
            'is_graduated' => false,
        ]);
    }

    public function test_guest_cannot_access_youth_dashboard(): void
    {
        $response = $this->get(route('youth.youth-dashboard.index'));
        $response->assertRedirect('/');
    }

    public function test_authenticated_youth_can_view_dashboard(): void
    {
        $response = $this->actingAs($this->youth, 'youth')
            ->get(route('youth.youth-dashboard.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('youth/youth-dashboard-page')
            ->has('profile')
            ->has('scholarshipStats')
            ->has('scholarshipApplications')
            ->has('registeredActivitiesCount')
            ->has('upcomingActivities')
        );
    }
}
