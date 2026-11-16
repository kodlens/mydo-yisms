<?php

namespace Tests\Feature;

use App\Models\Barangay;
use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Models\CashIncentiveRelease;
use App\Models\City;
use App\Models\Province;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class YouthCashIncentivesTest extends TestCase
{
    use DatabaseTransactions;

    protected YouthProfile $youth;
    protected User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $barangay = Barangay::first();
        $city = City::first();
        $province = Province::first();

        $this->staff = User::first() ?? User::create([
            'fname' => 'Admin',
            'lname' => 'User',
            'email' => 'admin_test_' . uniqid() . '@example.com',
            'role' => 'admin',
            'password' => Hash::make('password123'),
        ]);

        $this->youth = YouthProfile::create([
            'email' => 'youth_inc_' . uniqid() . '@example.com',
            'fname' => 'Incentive',
            'lname' => 'Recipient',
            'mname' => 'T',
            'sex' => 'Female',
            'civil_status' => 'Single',
            'birth_date' => '2004-03-01',
            'mobile_number' => '09171234567',
            'provCode' => $province?->provCode ?? '973',
            'citymunCode' => $city?->citymunCode ?? '97308',
            'brgyCode' => $barangay?->brgyCode ?? '97308035',
            'street_address' => 'Purok 2',
            'school_name' => 'Bukidnon State University',
            'program' => 'BS Information Technology',
            'year' => 2,
            'guardian_name' => 'Guardian Name',
            'guardian_contact_number' => '09181234567',
            'monthly_family_income' => 12000,
            'password' => Hash::make('password123'),
            'role' => 'youth',
            'is_active' => true,
            'is_graduated' => false,
        ]);
    }

    public function test_guest_cannot_access_youth_cash_incentives(): void
    {
        $response = $this->get(route('youth.youth-cash-incentives.index'));
        $response->assertRedirect('/');
    }

    public function test_authenticated_youth_can_view_cash_incentives_page(): void
    {
        $response = $this->actingAs($this->youth, 'youth')
            ->get(route('youth.youth-cash-incentives.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('youth/cash-incentives/youth-cash-incentives-page')
            ->has('records')
            ->has('availableYears')
            ->has('stats')
        );
    }

    public function test_youth_can_view_cash_incentive_records_and_filter_by_year(): void
    {
        $program2025 = CashIncentiveProgram::create([
            'code' => 'TEST-2025-' . uniqid(),
            'title' => 'Aid Program 2025',
            'funding_year' => 2025,
            'amount_per_beneficiary' => 3000,
            'allocated_budget' => 30000,
            'max_beneficiaries' => 10,
            'status' => 'completed',
            'created_by_user_id' => $this->staff->id,
        ]);

        $program2026 = CashIncentiveProgram::create([
            'code' => 'TEST-2026-' . uniqid(),
            'title' => 'Aid Program 2026',
            'funding_year' => 2026,
            'amount_per_beneficiary' => 5000,
            'allocated_budget' => 50000,
            'max_beneficiaries' => 10,
            'status' => 'ongoing',
            'created_by_user_id' => $this->staff->id,
        ]);

        $b2025 = CashIncentiveBeneficiary::create([
            'program_id' => $program2025->id,
            'youth_profile_id' => $this->youth->id,
            'status' => 'approved',
            'selected_by_user_id' => $this->staff->id,
            'selected_at' => now(),
            'historical_school_name' => 'Bukidnon State University',
            'historical_program' => 'BS Information Technology',
            'historical_year_level' => 1,
        ]);

        CashIncentiveRelease::create([
            'program_id' => $program2025->id,
            'beneficiary_id' => $b2025->id,
            'amount' => 3000,
            'status' => 'released',
            'actual_release_date' => now(),
            'acknowledgment_reference' => 'ACK-2025-001',
            'released_by_user_id' => $this->staff->id,
        ]);

        $b2026 = CashIncentiveBeneficiary::create([
            'program_id' => $program2026->id,
            'youth_profile_id' => $this->youth->id,
            'status' => 'approved',
            'selected_by_user_id' => $this->staff->id,
            'selected_at' => now(),
            'historical_school_name' => 'Bukidnon State University',
            'historical_program' => 'BS Information Technology',
            'historical_year_level' => 2,
        ]);

        CashIncentiveRelease::create([
            'program_id' => $program2026->id,
            'beneficiary_id' => $b2026->id,
            'amount' => 5000,
            'status' => 'scheduled',
            'scheduled_release_date' => now()->addDays(7),
        ]);

        // Access all years
        $responseAll = $this->actingAs($this->youth, 'youth')
            ->get(route('youth.youth-cash-incentives.index'));

        $responseAll->assertOk();
        $responseAll->assertInertia(fn ($page) => $page
            ->component('youth/cash-incentives/youth-cash-incentives-page')
            ->has('records', 2)
            ->where('stats.total_received', 3000)
            ->where('stats.total_records', 2)
        );

        // Filter by 2026
        $response2026 = $this->actingAs($this->youth, 'youth')
            ->get(route('youth.youth-cash-incentives.index', ['year' => 2026]));

        $response2026->assertOk();
        $response2026->assertInertia(fn ($page) => $page
            ->component('youth/cash-incentives/youth-cash-incentives-page')
            ->has('records', 1)
        );
    }
}
