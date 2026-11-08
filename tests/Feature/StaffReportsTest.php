<?php

namespace Tests\Feature;

use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Models\CashIncentiveRelease;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Str;
use Tests\TestCase;

class StaffReportsTest extends TestCase
{
    use DatabaseTransactions;

    protected function createStaffUser(): User
    {
        return User::create([
            'username' => 'staff_' . Str::random(6),
            'fname' => 'Staff',
            'lname' => 'Officer',
            'email' => 'staff_' . Str::random(6) . '@example.gov.ph',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'is_active' => true,
        ]);
    }

    public function test_guests_and_non_staff_cannot_access_staff_reports(): void
    {
        $response = $this->get('/staff/reports');
        $response->assertRedirect();

        $adminUser = User::create([
            'username' => 'admin_' . Str::random(6),
            'fname' => 'Admin',
            'lname' => 'Executive',
            'email' => 'admin_' . Str::random(6) . '@example.gov.ph',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->actingAs($adminUser, 'web')->get('/staff/reports')->assertRedirect('/admin/dashboard');
    }

    public function test_staff_can_view_reports_page_with_financial_and_barangay_metrics(): void
    {
        $staff = $this->createStaffUser();

        $program = CashIncentiveProgram::create([
            'code' => 'CIP-2026-TEST',
            'title' => 'Tertiary Student Aid 2026',
            'funding_year' => 2026,
            'amount_per_beneficiary' => 5000.00,
            'allocated_budget' => 250000.00,
            'max_beneficiaries' => 50,
            'status' => 'open',
            'created_by_user_id' => $staff->id,
        ]);

        $youth1 = YouthProfile::create([
            'student_id' => 'STU-001',
            'email' => 'youth1@example.com',
            'password' => bcrypt('password'),
            'fname' => 'Maria',
            'lname' => 'Santos',
            'sex' => 'Female',
            'school_name' => 'State University',
            'program' => 'BS Accountancy',
            'year' => 2,
            'is_active' => true,
        ]);

        $beneficiary1 = CashIncentiveBeneficiary::create([
            'program_id' => $program->id,
            'youth_profile_id' => $youth1->id,
            'status' => 'approved',
            'historical_brgy_code' => '103503001',
            'historical_brgy_name' => 'Barangay Poblacion',
            'historical_school_name' => 'State University',
            'historical_program' => 'BS Accountancy',
            'historical_educational_status' => 'College (2nd Year)',
            'selected_by_user_id' => $staff->id,
            'reviewed_by_user_id' => $staff->id,
        ]);

        CashIncentiveRelease::create([
            'program_id' => $program->id,
            'beneficiary_id' => $beneficiary1->id,
            'amount' => 5000.00,
            'status' => 'released',
            'actual_release_date' => now(),
            'released_by_user_id' => $staff->id,
            'acknowledgment_reference' => 'PR-2026-0001',
        ]);

        $response = $this->actingAs($staff, 'web')->get('/staff/reports');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('staff/reports/staff-reports-page')
            ->has('reportData.kpis')
            ->where('reportData.kpis.total_disbursed', 5000)
            ->where('reportData.kpis.total_budget', 250000)
            ->where('reportData.kpis.total_students_given', 1)
            ->where('reportData.kpis.total_barangays_given', 1)
            ->has('reportData.financial.weekly')
            ->has('reportData.financial.monthly')
            ->has('reportData.financial.yearly')
            ->has('reportData.barangays.items')
            ->has('reportData.students.by_educational_status')
        );
    }

    public function test_staff_can_query_reports_json_data(): void
    {
        $staff = $this->createStaffUser();

        $response = $this->actingAs($staff, 'web')->getJson('/staff/reports/data');

        $response->assertOk();
        $response->assertJsonStructure([
            'filters',
            'options',
            'kpis',
            'financial' => ['weekly', 'monthly', 'yearly'],
            'barangays' => ['items'],
            'students',
        ]);
    }

    public function test_staff_can_export_financial_and_barangay_reports_csv(): void
    {
        $staff = $this->createStaffUser();

        $financialCsv = $this->actingAs($staff, 'web')->get('/staff/reports/export?type=financial');
        $financialCsv->assertOk();
        $this->assertStringContainsString('text/csv', $financialCsv->headers->get('Content-Type') ?? '');

        $barangayCsv = $this->actingAs($staff, 'web')->get('/staff/reports/export?type=barangay');
        $barangayCsv->assertOk();
        $this->assertStringContainsString('text/csv', $barangayCsv->headers->get('Content-Type') ?? '');
    }
}
