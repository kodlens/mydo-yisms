<?php

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\ActivityRegistration;
use App\Models\YouthProfile;
use Illuminate\Support\Str;

function makeAdminAttendanceYouth(array $attributes = []): YouthProfile
{
    return YouthProfile::create(array_merge([
        'email' => 'youth_' . Str::random(8) . '@example.test',
        'lname' => 'Reyes',
        'fname' => 'Angela',
        'student_id' => 'STU-' . strtoupper(Str::random(5)),
        'password' => bcrypt('password'),
        'role' => 'youth',
        'status' => 'approved',
        'is_active' => true,
    ], $attributes));
}

function makeAdminAttendanceActivity(array $attributes = []): Activity
{
    $categoryId = ActivityCategory::firstOrCreate(
        ['slug' => 'civic-leadership'],
        ['name' => 'Civic Leadership', 'slug' => 'civic-leadership', 'is_active' => true]
    )->id;

    $suffix = Str::lower(Str::random(6));

    return Activity::create(array_merge([
        'activity_category_id' => $categoryId,
        'title' => "Admin Youth Assembly {$suffix}",
        'slug' => "admin-youth-assembly-{$suffix}",
        'description' => 'Municipal youth assembly managed by admin.',
        'venue_name' => 'Dumingag Municipal Hall',
        'starts_at' => now()->addDays(2),
        'ends_at' => now()->addDays(2)->addHours(4),
        'requires_registration' => true,
        'requires_approval' => false,
        'status' => 'published',
        'published_at' => now()->subDay(),
    ], $attributes));
}

test('guests, youth, and staff cannot access admin events and attendance endpoints', function () {
    $activity = makeAdminAttendanceActivity();

    // Guest
    $this->get('/admin/events-activities')->assertRedirect();
    $this->get("/admin/events-activities/{$activity->id}/attendance")->assertRedirect();
    $this->postJson("/admin/events-activities/{$activity->id}/attendance", [
        'reference_code' => 'YD-TEST-0001',
        'method' => 'qr',
    ])->assertUnauthorized();

    // Staff
    $staff = makeUser('staff');
    $this->actingAs($staff);
    $this->get('/admin/events-activities')->assertRedirect('/staff/dashboard');
    $this->get("/admin/events-activities/{$activity->id}/attendance")->assertRedirect('/staff/dashboard');

    // Youth
    $youth = makeAdminAttendanceYouth();
    $this->actingAs($youth, 'youth');
    $this->get('/admin/events-activities')->assertRedirect();
    $this->get("/admin/events-activities/{$activity->id}/attendance")->assertRedirect();
});

test('admin can view events directory, create activity, and see attendance counts', function () {
    $admin = makeUser('admin');
    $this->actingAs($admin);

    $this->get('/admin/events-activities')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/events-activities/admin-events-activities-page'));

    $category = ActivityCategory::firstOrCreate(
        ['slug' => 'sports-fest'],
        ['name' => 'Sports Fest', 'slug' => 'sports-fest', 'is_active' => true]
    );

    $createResponse = $this->postJson('/admin/events-activities', [
        'activity_category_id' => $category->id,
        'title' => 'Municipal Youth Sports Fest',
        'summary' => 'Annual municipal youth sports gathering.',
        'description' => 'Full day sports and leadership workshop.',
        'venue_name' => 'Municipal Plaza',
        'venue_address' => 'Poblacion, Dumingag',
        'starts_at' => now()->addDays(5)->format('Y-m-d H:i:s'),
        'ends_at' => now()->addDays(5)->addHours(6)->format('Y-m-d H:i:s'),
        'capacity' => 100,
        'requires_registration' => true,
        'requires_approval' => true,
        'status' => 'published',
        'is_featured' => false,
    ]);

    $createResponse->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.title', 'Municipal Youth Sports Fest');

    $activityId = $createResponse->json('data.id');

    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $admin->id,
        'actor_role' => 'admin',
        'action' => 'activity.created',
        'subject_id' => $activityId,
    ]);

    $dataResponse = $this->getJson('/admin/events-activities/data?search=Municipal+Youth+Sports+Fest');
    $dataResponse->assertOk();
    expect($dataResponse->json('data.0.attendances_count'))->toBe(0);
});

test('admin can render attendance page and record qr and manual check-ins', function () {
    $admin = makeUser('admin');
    $this->actingAs($admin);

    $activity = makeAdminAttendanceActivity();
    $youthQr = makeAdminAttendanceYouth(['fname' => 'Carlos', 'lname' => 'Mendoza']);
    $youthManual = makeAdminAttendanceYouth(['fname' => 'Elena', 'lname' => 'Cruz']);

    ActivityRegistration::create([
        'activity_id' => $activity->id,
        'youth_profile_id' => $youthQr->id,
        'status' => 'approved',
        'registered_at' => now(),
    ]);

    ActivityRegistration::create([
        'activity_id' => $activity->id,
        'youth_profile_id' => $youthManual->id,
        'status' => 'approved',
        'registered_at' => now(),
    ]);

    // Render Inertia attendance page
    $this->get("/admin/events-activities/{$activity->id}/attendance")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/events-activities/admin-activity-attendance-page')
            ->where('activity.id', $activity->id)
            ->where('initialSummary.approved_registrations_count', 2)
        );

    // Record QR attendance
    $qrRes = $this->postJson("/admin/events-activities/{$activity->id}/attendance", [
        'reference_code' => $youthQr->reference_code,
        'method' => 'qr',
    ]);

    $qrRes->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.full_name', 'Carlos Mendoza')
        ->assertJsonPath('summary.attended_count', 1)
        ->assertJsonPath('summary.qr_count', 1);

    // Record Manual attendance
    $manualRes = $this->postJson("/admin/events-activities/{$activity->id}/attendance", [
        'reference_code' => strtolower($youthManual->reference_code),
        'method' => 'manual',
        'remarks' => 'Verified by Admin at VIP desk',
    ]);

    $manualRes->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.full_name', 'Elena Cruz')
        ->assertJsonPath('summary.attended_count', 2)
        ->assertJsonPath('summary.manual_count', 1);

    // Prevent duplicate check-in
    $this->postJson("/admin/events-activities/{$activity->id}/attendance", [
        'reference_code' => $youthQr->reference_code,
        'method' => 'qr',
    ])->assertStatus(422)->assertJsonValidationErrors(['duplicate']);

    // Fetch live attendance data list
    $listRes = $this->getJson("/admin/events-activities/{$activity->id}/attendance/data");
    $listRes->assertOk()
        ->assertJsonPath('summary.attended_count', 2)
        ->assertJsonPath('attendances.total', 2);
});

test('admin can remove attendance record and generate admin audit log', function () {
    $admin = makeUser('admin');
    $this->actingAs($admin);

    $activity = makeAdminAttendanceActivity();
    $youth = makeAdminAttendanceYouth(['fname' => 'Paolo', 'lname' => 'Villanueva']);

    ActivityRegistration::create([
        'activity_id' => $activity->id,
        'youth_profile_id' => $youth->id,
        'status' => 'approved',
        'registered_at' => now(),
    ]);

    $record = $this->postJson("/admin/events-activities/{$activity->id}/attendance", [
        'reference_code' => $youth->reference_code,
        'method' => 'manual',
    ])->json('data');

    $attendanceId = $record['id'];

    // Reject missing reason
    $this->deleteJson("/admin/events-activities/{$activity->id}/attendance/{$attendanceId}", [])
        ->assertStatus(422);

    // Valid removal
    $this->deleteJson("/admin/events-activities/{$activity->id}/attendance/{$attendanceId}", [
        'reason' => 'Duplicate entry test corrected by Administrator',
    ])->assertOk()->assertJsonPath('success', true);

    $this->assertDatabaseMissing('activity_attendances', ['id' => $attendanceId]);

    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $admin->id,
        'actor_role' => 'admin',
        'action' => 'activity_attendance.removed',
        'subject_id' => $attendanceId,
    ]);
});

test('admin can approve participant sign-ups from participants endpoint', function () {
    $admin = makeUser('admin');
    $this->actingAs($admin);

    $activity = makeAdminAttendanceActivity(['requires_approval' => true]);
    $youth = makeAdminAttendanceYouth(['fname' => 'Rosa', 'lname' => 'Bautista']);

    $registration = ActivityRegistration::create([
        'activity_id' => $activity->id,
        'youth_profile_id' => $youth->id,
        'status' => 'pending',
        'registered_at' => now(),
    ]);

    $this->get("/admin/events-activities/{$activity->id}/participants")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/events-activities/admin-activity-participants-page'));

    $this->patchJson("/admin/events-activities/{$activity->id}/participants/{$registration->id}", [
        'status' => 'approved',
    ])->assertOk()->assertJsonPath('data.status', 'approved');

    expect($registration->fresh()->status)->toBe('approved');
    expect($registration->fresh()->reviewed_by)->toBe($admin->id);
});
