<?php

use App\Models\CashIncentiveBeneficiary;
use App\Models\CashIncentiveProgram;
use App\Models\CashIncentiveRelease;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Support\Str;

function makeAdminUser(array $overrides = []): User
{
    return User::create(array_merge([
        'username' => 'admin_' . Str::random(6),
        'fname' => 'System',
        'lname' => 'Administrator',
        'email' => 'admin_' . Str::random(6) . '@example.gov.ph',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ], $overrides));
}

function makeStaffUserForAdminTest(array $overrides = []): User
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

function makeYouthProfileForAdminTest(array $overrides = []): YouthProfile
{
    return YouthProfile::create(array_merge([
        'fname' => 'AdminTest',
        'lname' => 'Youth ' . Str::random(4),
        'email' => 'youth_' . Str::random(6) . '@example.com',
        'password' => bcrypt('password'),
        'is_active' => true,
        'school_name' => 'Admin Test University',
        'program' => 'BS Computer Science',
        'year' => 2,
        'is_graduated' => false,
    ], $overrides));
}

test('guests and non-admins cannot access admin cash incentive endpoints', function () {
    $program = CashIncentiveProgram::create([
        'code' => 'CIP-ADM-001',
        'title' => 'Admin Restricted Program',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 3000,
        'allocated_budget' => 300000,
        'max_beneficiaries' => 100,
        'status' => 'active',
    ]);

    // Guest redirected to login
    $this->get('/admin/cash-incentives')->assertRedirect();
    $this->get("/admin/cash-incentives/{$program->id}")->assertRedirect();

    // Staff user blocked from admin endpoints (redirected to staff dashboard)
    $staff = makeStaffUserForAdminTest();
    $this->actingAs($staff, 'web')
        ->get('/admin/cash-incentives')
        ->assertRedirect('/staff/dashboard');
});

test('admin can access index and create a cash incentive program with budget validation', function () {
    $admin = makeAdminUser();

    $this->actingAs($admin, 'web')
        ->get('/admin/cash-incentives')
        ->assertOk();

    // Valid creation
    $response = $this->actingAs($admin, 'web')->post('/admin/cash-incentives', [
        'title' => 'Admin Special Education Grant 2026',
        'code' => 'CIP-ADM-2026',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 6000,
        'allocated_budget' => 600000,
        'max_beneficiaries' => 100,
        'status' => 'active',
        'description' => 'Created via admin portal',
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('cash_incentive_programs', [
        'code' => 'CIP-ADM-2026',
        'title' => 'Admin Special Education Grant 2026',
        'amount_per_beneficiary' => 6000,
    ]);

    // Invalid budget creation: max_beneficiaries * amount > budget
    $badResponse = $this->actingAs($admin, 'web')->post('/admin/cash-incentives', [
        'title' => 'Underfunded Program Admin',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 5000,
        'allocated_budget' => 10000,
        'max_beneficiaries' => 50,
        'status' => 'draft',
    ]);

    $badResponse->assertSessionHasErrors('allocated_budget');
});

test('admin can enroll eligible youth, review eligibility, and disburse cash incentives', function () {
    $admin = makeAdminUser();
    $youth = makeYouthProfileForAdminTest();

    $program = CashIncentiveProgram::create([
        'code' => 'CIP-ADM-FULL',
        'title' => 'Full Workflow Program',
        'funding_year' => 2026,
        'amount_per_beneficiary' => 4000,
        'allocated_budget' => 400000,
        'max_beneficiaries' => 100,
        'status' => 'active',
    ]);

    // Admin views eligible youth pool
    $poolResponse = $this->actingAs($admin, 'web')
        ->getJson("/admin/cash-incentives/{$program->id}/eligible-youth");
    $poolResponse->assertOk();

    // Admin enrolls youth
    $enrollResponse = $this->actingAs($admin, 'web')->post("/admin/cash-incentives/{$program->id}/beneficiaries/select", [
        'youth_profile_id' => $youth->id,
        'remarks' => 'Enrolled by Administrator',
    ]);
    $enrollResponse->assertSessionHasNoErrors();

    $beneficiary = CashIncentiveBeneficiary::where('program_id', $program->id)
        ->where('youth_profile_id', $youth->id)
        ->first();
    expect($beneficiary)->not->toBeNull();
    expect($beneficiary->status)->toBe('approved');

    // Admin reviews beneficiary (can reject or re-approve)
    $reviewResponse = $this->actingAs($admin, 'web')->post("/admin/cash-incentives/{$program->id}/beneficiaries/{$beneficiary->id}/review", [
        'status' => 'rejected',
        'rejection_reason' => 'Disqualified due to academic / age criteria (must be 15 to 30 years old)',
        'remarks' => 'Review notes by Administrator',
    ]);
    $reviewResponse->assertSessionHasNoErrors();
    expect($beneficiary->fresh()->status)->toBe('rejected');

    // Re-approve for release
    $this->actingAs($admin, 'web')->post("/admin/cash-incentives/{$program->id}/beneficiaries/{$beneficiary->id}/review", [
        'status' => 'approved',
        'remarks' => 'Re-instated by Administrator',
    ])->assertSessionHasNoErrors();
    expect($beneficiary->fresh()->status)->toBe('approved');

    // Admin records disbursement
    $releaseResponse = $this->actingAs($admin, 'web')->post("/admin/cash-incentives/{$program->id}/releases/{$beneficiary->id}/record", [
        'acknowledgment_reference' => 'ADM-VOUCHER-001',
        'remarks' => 'Disbursed in cash with signed payroll',
    ]);
    $releaseResponse->assertSessionHasNoErrors();

    $release = CashIncentiveRelease::where('beneficiary_id', $beneficiary->id)->first();
    expect($release)->not->toBeNull();
    expect($release->status)->toBe('released');
    expect((float) $release->amount)->toBe(4000.0);

    // Admin downloads CSV export
    $exportResponse = $this->actingAs($admin, 'web')
        ->get("/admin/cash-incentives/{$program->id}/reports/export-csv");
    $exportResponse->assertOk();

    // Admin reverts disbursement
    $revertResponse = $this->actingAs($admin, 'web')->post("/admin/cash-incentives/{$program->id}/releases/{$beneficiary->id}/revert", [
        'reason' => 'Administrative correction',
    ]);
    $revertResponse->assertSessionHasNoErrors();
    expect($release->fresh()->status)->toBe('pending');
});
