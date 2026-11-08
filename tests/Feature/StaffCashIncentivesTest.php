<?php

use App\Models\ActivityLog;
use App\Models\Barangay;
use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Models\CashIncentiveRelease;
use App\Models\CashIncentiveStatusHistory;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Support\Str;

function makeStaffUser(array $overrides = []): User
{
    return User::create(array_merge([
        'username' => 'staff_' . Str::random(6),
        'fname' => 'Staff',
        'lname' => 'Officer',
        'email' => 'staff_' . Str::random(6) . '@example.gov.ph',
        'password' => bcrypt('password'),
        'role' => 'staff',
    ], $overrides));
}

function makeYouthProfile(array $overrides = []): YouthProfile
{
    return YouthProfile::create(array_merge([
        'fname' => 'Juan',
        'lname' => 'Dela Cruz ' . Str::random(4),
        'email' => 'youth_' . Str::random(6) . '@example.com',
        'password' => bcrypt('password'),
        'is_active' => true,
        'school_name' => 'State University',
        'program' => 'BS Information Technology',
        'year' => 3,
        'is_graduated' => false,
    ], $overrides));
}

test('guests and youth cannot access staff cash incentive endpoints', function () {
    $program = CashIncentiveProgram::create([
        'code' => 'CIP-TEST-001',
        'title' => 'Test Program',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 3000,
        'allocated_budget' => 300000,
        'max_beneficiaries' => 100,
        'status' => 'active',
    ]);

    // Guest blocked
    $this->get('/staff/cash-incentives')->assertRedirect();
    $this->get("/staff/cash-incentives/{$program->id}")->assertRedirect();

    // Youth blocked
    $youth = makeYouthProfile();
    $this->actingAs($youth, 'youth')
        ->get('/staff/cash-incentives')
        ->assertRedirect();
});

test('staff can create a cash incentive program with budget validation', function () {
    $staff = makeStaffUser();

    // Valid creation
    $response = $this->actingAs($staff, 'web')->post('/staff/cash-incentives', [
        'title' => 'Tertiary Financial Assistance 2026',
        'code' => 'CIP-2026-TFA',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 5000,
        'allocated_budget' => 500000,
        'max_beneficiaries' => 100,
        'status' => 'active',
        'description' => 'Test guidelines',
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('cash_incentive_programs', [
        'code' => 'CIP-2026-TFA',
        'title' => 'Tertiary Financial Assistance 2026',
        'amount_per_beneficiary' => 5000,
    ]);

    // Invalid budget creation: max_beneficiaries * amount > budget
    $badResponse = $this->actingAs($staff, 'web')->post('/staff/cash-incentives', [
        'title' => 'Underfunded Program',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 5000,
        'allocated_budget' => 10000, // only covers 2 beneficiaries
        'max_beneficiaries' => 50,    // requires 250,000
        'status' => 'draft',
    ]);

    $badResponse->assertSessionHasErrors('allocated_budget');
});

test('staff can query eligible youth pool and select a beneficiary with historical snapshot', function () {
    $staff = makeStaffUser();
    $youth = makeYouthProfile([
        'fname' => 'Maria',
        'lname' => 'Clara',
        'school_name' => 'Polytechnic College',
        'program' => 'BS Accountancy',
        'year' => 2,
    ]);

    $program = CashIncentiveProgram::create([
        'code' => 'CIP-2026-002',
        'title' => 'Academic Grant',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 4000,
        'allocated_budget' => 400000,
        'max_beneficiaries' => 100,
        'status' => 'active',
    ]);

    // Query youth pool
    $this->actingAs($staff, 'web')
        ->getJson("/staff/cash-incentives/{$program->id}/eligible-youth?search=Maria")
        ->assertOk()
        ->assertJsonFragment(['full_name' => 'Maria Clara']);

    // Select youth into program
    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/beneficiaries/select", [
            'youth_profile_id' => $youth->id,
            'remarks' => 'Pre-selected for high scholastic rating',
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('cash_incentive_beneficiaries', [
        'program_id' => $program->id,
        'youth_profile_id' => $youth->id,
        'status' => 'approved',
        'historical_school_name' => 'Polytechnic College',
        'historical_program' => 'BS Accountancy',
    ]);

    // Youth should now be excluded from eligible pool
    $this->actingAs($staff, 'web')
        ->getJson("/staff/cash-incentives/{$program->id}/eligible-youth?search=Maria")
        ->assertOk()
        ->assertJsonMissing(['id' => $youth->id]);
});

test('staff can batch select multiple youth beneficiaries at once', function () {
    $staff = makeStaffUser();
    $youth1 = makeYouthProfile();
    $youth2 = makeYouthProfile();

    $program = CashIncentiveProgram::create([
        'code' => 'CIP-2026-BATCH',
        'title' => 'Batch Selection Program',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 3000,
        'allocated_budget' => 300000,
        'max_beneficiaries' => 100,
        'status' => 'active',
    ]);

    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/beneficiaries/select", [
            'youth_profile_ids' => [$youth1->id, $youth2->id],
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('cash_incentive_beneficiaries', [
        'program_id' => $program->id,
        'youth_profile_id' => $youth1->id,
    ]);

    $this->assertDatabaseHas('cash_incentive_beneficiaries', [
        'program_id' => $program->id,
        'youth_profile_id' => $youth2->id,
    ]);
});

test('duplicate selection in the same program is strictly prevented', function () {
    $staff = makeStaffUser();
    $youth = makeYouthProfile();

    $program = CashIncentiveProgram::create([
        'code' => 'CIP-2026-003',
        'title' => 'Special Grant',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 3000,
        'allocated_budget' => 300000,
        'max_beneficiaries' => 100,
        'status' => 'active',
    ]);

    // First selection
    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/beneficiaries/select", [
            'youth_profile_id' => $youth->id,
        ])
        ->assertSessionHasNoErrors();

    // Second selection of the same youth in the same program
    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/beneficiaries/select", [
            'youth_profile_id' => $youth->id,
        ])
        ->assertSessionHasErrors('youth_profile_id');
});

test('cannot select beneficiaries beyond max_beneficiaries limit', function () {
    $staff = makeStaffUser();
    $youth1 = makeYouthProfile();
    $youth2 = makeYouthProfile();

    $program = CashIncentiveProgram::create([
        'code' => 'CIP-2026-004',
        'title' => 'Small Quota Program',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 2000,
        'allocated_budget' => 2000,
        'max_beneficiaries' => 1, // Only 1 allowed
        'status' => 'active',
    ]);

    // Select first (allowed)
    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/beneficiaries/select", [
            'youth_profile_id' => $youth1->id,
        ])
        ->assertSessionHasNoErrors();

    // Select second (blocked by max beneficiaries)
    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/beneficiaries/select", [
            'youth_profile_id' => $youth2->id,
        ])
        ->assertSessionHasErrors('youth_profile_id');
});

test('staff can individually approve or reject selected beneficiaries with audit history', function () {
    $staff = makeStaffUser();
    $youth = makeYouthProfile();

    $program = CashIncentiveProgram::create([
        'code' => 'CIP-2026-005',
        'title' => 'Review Program',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 3000,
        'allocated_budget' => 300000,
        'max_beneficiaries' => 100,
        'status' => 'active',
    ]);

    $beneficiary = CashIncentiveBeneficiary::create([
        'program_id' => $program->id,
        'youth_profile_id' => $youth->id,
        'status' => 'pending',
        'selected_by_user_id' => $staff->id,
        'selected_at' => now(),
    ]);

    // Rejection requires reason
    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/beneficiaries/{$beneficiary->id}/review", [
            'status' => 'rejected',
            'rejection_reason' => '',
        ])
        ->assertSessionHasErrors('rejection_reason');

    // Valid rejection
    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/beneficiaries/{$beneficiary->id}/review", [
            'status' => 'rejected',
            'rejection_reason' => 'Family income exceeds ceiling',
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('cash_incentive_beneficiaries', [
        'id' => $beneficiary->id,
        'status' => 'rejected',
        'rejection_reason' => 'Family income exceeds ceiling',
    ]);

    // Approve beneficiary
    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/beneficiaries/{$beneficiary->id}/review", [
            'status' => 'approved',
            'remarks' => 'Reconsidered after income appeals hearing',
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('cash_incentive_beneficiaries', [
        'id' => $beneficiary->id,
        'status' => 'approved',
    ]);

    // Pending release record is automatically initialized with fixed amount
    $this->assertDatabaseHas('cash_incentive_releases', [
        'program_id' => $program->id,
        'beneficiary_id' => $beneficiary->id,
        'amount' => 3000,
        'status' => 'pending',
    ]);

    // Audit status history created
    $this->assertDatabaseHas('cash_incentive_status_histories', [
        'program_id' => $program->id,
        'beneficiary_id' => $beneficiary->id,
        'to_status' => 'approved',
        'action_type' => 'approved',
    ]);
});

test('cash release disburses funds directly and prevents duplicate payouts', function () {
    $staff = makeStaffUser();
    $youth = makeYouthProfile();

    $program = CashIncentiveProgram::create([
        'code' => 'CIP-2026-006',
        'title' => 'Disbursement Program',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 4500,
        'allocated_budget' => 450000,
        'max_beneficiaries' => 100,
        'status' => 'active',
    ]);

    $beneficiary = CashIncentiveBeneficiary::create([
        'program_id' => $program->id,
        'youth_profile_id' => $youth->id,
        'status' => 'approved',
        'selected_by_user_id' => $staff->id,
        'selected_at' => now(),
    ]);

    // Record valid release directly (no document upload required)
    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/releases/{$beneficiary->id}/record", [
            'acknowledgment_reference' => 'PR-2026-001',
            'remarks' => 'Claimed in person',
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('cash_incentive_releases', [
        'program_id' => $program->id,
        'beneficiary_id' => $beneficiary->id,
        'status' => 'released',
        'amount' => 4500,
        'acknowledgment_reference' => 'PR-2026-001',
    ]);

    // Duplicate release attempt -> blocked
    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/releases/{$beneficiary->id}/record", [
            'acknowledgment_reference' => 'PR-2026-002',
        ])
        ->assertSessionHasErrors('release');

    // Undo / revert release back to pending
    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/releases/{$beneficiary->id}/revert", [
            'reason' => 'Released to wrong line by mistake',
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('cash_incentive_releases', [
        'program_id' => $program->id,
        'beneficiary_id' => $beneficiary->id,
        'status' => 'pending',
    ]);
});

test('staff can batch release cash to multiple selected students', function () {
    $staff = makeStaffUser();
    $youth1 = makeYouthProfile();
    $youth2 = makeYouthProfile();

    $program = CashIncentiveProgram::create([
        'code' => 'CIP-2026-BATCH-REL',
        'title' => 'Batch Release Program',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 3000,
        'allocated_budget' => 300000,
        'max_beneficiaries' => 100,
        'status' => 'active',
    ]);

    $b1 = CashIncentiveBeneficiary::create([
        'program_id' => $program->id,
        'youth_profile_id' => $youth1->id,
        'status' => 'approved',
    ]);

    $b2 = CashIncentiveBeneficiary::create([
        'program_id' => $program->id,
        'youth_profile_id' => $youth2->id,
        'status' => 'approved',
    ]);

    $this->actingAs($staff, 'web')
        ->post("/staff/cash-incentives/{$program->id}/releases/batch", [
            'beneficiary_ids' => [$b1->id, $b2->id],
            'acknowledgment_reference' => 'BATCH-PR-01',
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('cash_incentive_releases', [
        'beneficiary_id' => $b1->id,
        'status' => 'released',
    ]);

    $this->assertDatabaseHas('cash_incentive_releases', [
        'beneficiary_id' => $b2->id,
        'status' => 'released',
    ]);
});

test('reports summary returns accurate metrics and export CSV works', function () {
    $staff = makeStaffUser();
    $youth = makeYouthProfile(['school_name' => 'State University', 'year' => 3]);

    $program = CashIncentiveProgram::create([
        'code' => 'CIP-2026-007',
        'title' => 'Report Analytics Program',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 5000,
        'allocated_budget' => 500000,
        'max_beneficiaries' => 100,
        'status' => 'active',
    ]);

    $beneficiary = CashIncentiveBeneficiary::create([
        'program_id' => $program->id,
        'youth_profile_id' => $youth->id,
        'status' => 'approved',
        'historical_brgy_name' => 'Barangay Poblacion',
        'historical_educational_status' => 'College (3rd Year)',
        'selected_by_user_id' => $staff->id,
        'selected_at' => now(),
    ]);

    CashIncentiveRelease::create([
        'program_id' => $program->id,
        'beneficiary_id' => $beneficiary->id,
        'amount' => 5000,
        'status' => 'released',
        'actual_release_date' => now(),
        'acknowledgment_reference' => 'PAYROLL-888',
        'released_by_user_id' => $staff->id,
    ]);

    // Reports JSON summary
    $res = $this->actingAs($staff, 'web')
        ->getJson("/staff/cash-incentives/{$program->id}/reports/summary")
        ->assertOk();

    $res->assertJsonPath('summary.approved_count', 1);
    $res->assertJsonPath('summary.released_count', 1);
    $res->assertJsonPath('summary.actual_released_amount', 5000);

    // Export CSV endpoint
    $csvRes = $this->actingAs($staff, 'web')
        ->get("/staff/cash-incentives/{$program->id}/reports/export-csv")
        ->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

    expect($csvRes->streamedContent())->toContain('PAYROLL-888');
});
