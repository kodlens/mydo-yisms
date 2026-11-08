<?php

use App\Models\AcademicYear;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipType;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

function makeAdminUserForApplicantsTest(array $overrides = []): User
{
    return User::create(array_merge([
        'username' => 'admin_' . Str::random(6),
        'fname' => 'Admin',
        'lname' => 'Super',
        'email' => 'admin_' . Str::random(6) . '@example.gov.ph',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ], $overrides));
}

function makeStaffUserForApplicantsTest(array $overrides = []): User
{
    return User::create(array_merge([
        'username' => 'staff_' . Str::random(6),
        'fname' => 'Staff',
        'lname' => 'Member',
        'email' => 'staff_' . Str::random(6) . '@example.gov.ph',
        'password' => bcrypt('password'),
        'role' => 'staff',
    ], $overrides));
}

test('guests and non-admins cannot access admin applicants or youth profiles', function () {
    // Guest redirected
    $this->get('/admin/applicants')->assertRedirect();
    $this->get('/admin/youth-profiles')->assertRedirect();

    // Staff redirected to staff dashboard
    $staff = makeStaffUserForApplicantsTest();
    $this->actingAs($staff, 'web')
        ->get('/admin/applicants')
        ->assertRedirect('/staff/dashboard');

    $this->actingAs($staff, 'web')
        ->get('/admin/youth-profiles')
        ->assertRedirect('/staff/dashboard');
});

test('admin can view applicants index, query data, and view applicant details', function () {
    $admin = makeAdminUserForApplicantsTest();

    $scholarship = ScholarshipType::create([
        'scholarship' => 'Admin Merit Grant ' . Str::random(4),
        'description' => 'Test',
        'is_active' => true,
    ]);

    $youth = YouthProfile::create([
        'fname' => 'Pedro',
        'lname' => 'Penduko',
        'email' => 'pedro_' . Str::random(6) . '@example.com',
        'password' => bcrypt('password'),
        'is_active' => true,
        'school_name' => 'City University',
        'program' => 'BS IT',
        'year' => 3,
    ]);

    $acadYear = AcademicYear::firstOrCreate(
        ['is_active' => true],
        ['code' => 'AY2026-2027', 'name' => '2026-2027', 'is_active' => true]
    );

    $application = ScholarshipApplication::create([
        'academic_year_id' => $acadYear->id,
        'scholarship_type_id' => $scholarship->id,
        'youth_profile_id' => $youth->id,
        'status' => 'pending',
    ]);

    // Admin views index
    $this->actingAs($admin, 'web')
        ->get('/admin/applicants')
        ->assertOk();

    // Admin queries applicants via getData API
    $this->actingAs($admin, 'web')
        ->getJson('/admin/get-applicants?search=Pedro')
        ->assertOk()
        ->assertJsonFragment(['fname' => 'Pedro']);

    // Admin views single application
    $this->actingAs($admin, 'web')
        ->get("/admin/applicants/{$application->id}")
        ->assertOk();

    // Admin updates applicant status to approved
    $this->actingAs($admin, 'web')
        ->patch("/admin/applicants/{$application->id}/status", [
            'registration_status' => 'approved',
        ])
        ->assertSessionHasNoErrors();

    expect($application->fresh()->status)->toBe('approved');
    expect($application->fresh()->reviewed_by)->toBe($admin->id);

    // Admin updates applicant status to rejected with reason
    $this->actingAs($admin, 'web')
        ->patch("/admin/applicants/{$application->id}/status", [
            'registration_status' => 'rejected',
            'rejection_reason' => 'Incomplete documents provided.',
        ])
        ->assertSessionHasNoErrors();

    expect($application->fresh()->status)->toBe('rejected');
    expect($application->fresh()->rejection_reason)->toBe('Incomplete documents provided.');
});

test('admin can view youth profiles directory and query data', function () {
    $admin = makeAdminUserForApplicantsTest();

    $youth = YouthProfile::create([
        'fname' => 'Clara',
        'lname' => 'Santos',
        'email' => 'clara_' . Str::random(6) . '@example.com',
        'password' => bcrypt('password'),
        'is_active' => true,
        'school_name' => 'National College',
        'program' => 'BS Nursing',
        'year' => 1,
    ]);

    // Admin views youth profiles index
    $this->actingAs($admin, 'web')
        ->get('/admin/youth-profiles')
        ->assertOk();

    // Admin queries youth profiles via getData API
    $this->actingAs($admin, 'web')
        ->getJson('/admin/get-youth-profiles?search=Clara')
        ->assertOk()
        ->assertJsonFragment(['fname' => 'Clara']);
});

test('admin can change password of a youth profile with validation', function () {
    $admin = makeAdminUserForApplicantsTest();

    $youth = YouthProfile::create([
        'fname' => 'Carlos',
        'lname' => 'Dalisay',
        'email' => 'carlos_' . Str::random(6) . '@example.com',
        'password' => bcrypt('oldpassword123'),
        'is_active' => true,
    ]);

    // Validation error when passwords do not match or are too short
    $this->actingAs($admin, 'web')
        ->postJson("/admin/youth-profiles/{$youth->id}/change-password", [
            'password' => '123',
            'password_confirmation' => 'mismatch',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['password']);

    // Successful password change
    $response = $this->actingAs($admin, 'web')
        ->postJson("/admin/youth-profiles/{$youth->id}/change-password", [
            'password' => 'newSecretPassword123',
            'password_confirmation' => 'newSecretPassword123',
        ]);

    $response->assertOk()
        ->assertJson(['status' => 'changed']);

    expect(Hash::check('newSecretPassword123', $youth->fresh()->password))->toBeTrue();
});

test('admin can change password of an administrative user with validation', function () {
    $admin = makeAdminUserForApplicantsTest();
    $targetUser = makeStaffUserForApplicantsTest([
        'password' => bcrypt('olduserpassword'),
    ]);

    // Validation error
    $this->actingAs($admin, 'web')
        ->postJson("/admin/change-password/{$targetUser->id}", [
            'password' => 'short',
            'password_confirmation' => 'different',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['password']);

    // Successful change
    $response = $this->actingAs($admin, 'web')
        ->postJson("/admin/change-password/{$targetUser->id}", [
            'password' => 'updatedUserPassword456',
            'password_confirmation' => 'updatedUserPassword456',
        ]);

    $response->assertOk()
        ->assertJson(['status' => 'changed']);

    expect(Hash::check('updatedUserPassword456', $targetUser->fresh()->password))->toBeTrue();
});
