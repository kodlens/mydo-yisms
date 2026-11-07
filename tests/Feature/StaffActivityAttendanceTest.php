<?php

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\ActivityLog;
use App\Models\ActivityRegistration;
use App\Models\YouthProfile;
use Illuminate\Support\Facades\DB;

function createTestYouth(array $attributes = []): YouthProfile
{
    static $seq = 0;
    $seq++;

    return YouthProfile::create(array_merge([
        'email' => "youth.attendance{$seq}@example.test",
        'lname' => 'Santos',
        'fname' => 'Maria',
        'student_id' => "STU-{$seq}",
        'password' => bcrypt('password'),
        'is_active' => true,
    ], $attributes));
}

function createTestActivity(array $attributes = []): Activity
{
    static $actSeq = 0;
    $actSeq++;

    $categoryId = ActivityCategory::firstOrCreate(
        ['slug' => 'leadership'],
        ['name' => 'Leadership', 'slug' => 'leadership', 'is_active' => true]
    )->id;

    return Activity::create(array_merge([
        'activity_category_id' => $categoryId,
        'title' => "Youth Summit {$actSeq}",
        'slug' => "youth-summit-{$actSeq}",
        'description' => 'Test youth activity description.',
        'venue_name' => 'Municipal Gymnasium',
        'starts_at' => now()->addDays(2),
        'ends_at' => now()->addDays(2)->addHours(4),
        'requires_registration' => true,
        'requires_approval' => false,
        'status' => 'published',
        'published_at' => now()->subDay(),
    ], $attributes));
}

function registerTestYouthToActivity(Activity $activity, YouthProfile $youth, string $status = 'approved'): ActivityRegistration
{
    return ActivityRegistration::create([
        'activity_id' => $activity->id,
        'youth_profile_id' => $youth->id,
        'status' => $status,
        'registered_at' => now(),
    ]);
}

test('guests and youth cannot access staff attendance recording endpoints', function () {
    $activity = createTestActivity();

    // Guests
    $this->get("/staff/events-activities/{$activity->id}/attendance")->assertRedirect();
    $this->postJson("/staff/events-activities/{$activity->id}/attendance", [
        'reference_code' => 'YD-TEST-1234',
        'method' => 'qr',
    ])->assertUnauthorized();

    // Youth
    $youth = createTestYouth();
    $this->actingAs($youth, 'youth');
    $this->get("/staff/events-activities/{$activity->id}/attendance")->assertRedirect();
    $this->postJson("/staff/events-activities/{$activity->id}/attendance", [
        'reference_code' => 'YD-TEST-1234',
        'method' => 'qr',
    ])->assertRedirect();
});

test('staff can record attendance using valid QR reference code', function () {
    $staff = makeUser('staff');
    $this->actingAs($staff);

    $activity = createTestActivity();
    $youth = createTestYouth();
    registerTestYouthToActivity($activity, $youth, 'approved');

    $response = $this->postJson("/staff/events-activities/{$activity->id}/attendance", [
        'reference_code' => $youth->reference_code,
        'method' => 'qr',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.full_name', 'Maria Santos')
        ->assertJsonPath('data.method', 'qr')
        ->assertJsonPath('summary.attended_count', 1);

    $this->assertDatabaseHas('activity_attendances', [
        'activity_id' => $activity->id,
        'youth_profile_id' => $youth->id,
        'recorded_by' => $staff->id,
        'method' => 'qr',
    ]);
});

test('staff can record attendance using manual entry fallback', function () {
    $staff = makeUser('staff');
    $this->actingAs($staff);

    $activity = createTestActivity();
    $youth = createTestYouth();
    registerTestYouthToActivity($activity, $youth, 'approved');

    $response = $this->postJson("/staff/events-activities/{$activity->id}/attendance", [
        'reference_code' => strtolower($youth->reference_code), // test case insensitivity
        'method' => 'manual',
        'remarks' => 'Verified with school ID card',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.method', 'manual')
        ->assertJsonPath('summary.attended_count', 1);

    $this->assertDatabaseHas('activity_attendances', [
        'activity_id' => $activity->id,
        'youth_profile_id' => $youth->id,
        'method' => 'manual',
        'remarks' => 'Verified with school ID card',
    ]);
});

test('duplicate attendance is strictly prevented', function () {
    $staff = makeUser('staff');
    $this->actingAs($staff);

    $activity = createTestActivity();
    $youth = createTestYouth();
    registerTestYouthToActivity($activity, $youth, 'approved');

    // First scan succeeds
    $this->postJson("/staff/events-activities/{$activity->id}/attendance", [
        'reference_code' => $youth->reference_code,
        'method' => 'qr',
    ])->assertCreated();

    // Second scan fails with 422 duplicate error
    $response = $this->postJson("/staff/events-activities/{$activity->id}/attendance", [
        'reference_code' => $youth->reference_code,
        'method' => 'qr',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['duplicate']);

    // Ensure database still has only 1 attendance row
    $this->assertEquals(1, $activity->attendances()->where('youth_profile_id', $youth->id)->count());
});

test('unregistered youth cannot record attendance', function () {
    $staff = makeUser('staff');
    $this->actingAs($staff);

    $activity = createTestActivity();
    $youth = createTestYouth();
    // Do NOT register youth to activity

    $response = $this->postJson("/staff/events-activities/{$activity->id}/attendance", [
        'reference_code' => $youth->reference_code,
        'method' => 'qr',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['reference_code']);

    $this->assertEquals(0, $activity->attendances()->count());
});

test('youth with pending or rejected registration cannot record attendance', function () {
    $staff = makeUser('staff');
    $this->actingAs($staff);

    $activity = createTestActivity();
    $pendingYouth = createTestYouth();
    registerTestYouthToActivity($activity, $pendingYouth, 'pending');

    $rejectedYouth = createTestYouth();
    registerTestYouthToActivity($activity, $rejectedYouth, 'rejected');

    // Pending check-in rejected
    $this->postJson("/staff/events-activities/{$activity->id}/attendance", [
        'reference_code' => $pendingYouth->reference_code,
        'method' => 'qr',
    ])->assertStatus(422)->assertJsonValidationErrors(['reference_code']);

    // Rejected check-in rejected
    $this->postJson("/staff/events-activities/{$activity->id}/attendance", [
        'reference_code' => $rejectedYouth->reference_code,
        'method' => 'qr',
    ])->assertStatus(422)->assertJsonValidationErrors(['reference_code']);
});

test('attendance cannot be recorded for cancelled or draft activities', function () {
    $staff = makeUser('staff');
    $this->actingAs($staff);

    $cancelledActivity = createTestActivity(['status' => 'cancelled']);
    $youth = createTestYouth();
    registerTestYouthToActivity($cancelledActivity, $youth, 'approved');

    $this->postJson("/staff/events-activities/{$cancelledActivity->id}/attendance", [
        'reference_code' => $youth->reference_code,
        'method' => 'qr',
    ])->assertStatus(422)->assertJsonValidationErrors(['activity']);
});

test('administrative attendance removal creates audit log', function () {
    $staff = makeUser('staff');
    $this->actingAs($staff);

    $activity = createTestActivity();
    $youth = createTestYouth(['fname' => 'Pedro', 'lname' => 'Gomez']);
    registerTestYouthToActivity($activity, $youth, 'approved');

    // First record attendance
    $record = $this->postJson("/staff/events-activities/{$activity->id}/attendance", [
        'reference_code' => $youth->reference_code,
        'method' => 'qr',
    ])->json('data');

    $attendanceId = $record['id'];

    // Removal without reason fails
    $this->deleteJson("/staff/events-activities/{$activity->id}/attendance/{$attendanceId}", [])
        ->assertStatus(422);

    // Removal with valid reason succeeds
    $response = $this->deleteJson("/staff/events-activities/{$activity->id}/attendance/{$attendanceId}", [
        'reason' => 'Scanned wrong QR pass accidentally at entrance',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true);

    // Verify removed from database
    $this->assertDatabaseMissing('activity_attendances', ['id' => $attendanceId]);

    // Verify audit log created
    $this->assertDatabaseHas('activity_logs', [
        'user_id' => $staff->id,
        'action' => 'activity_attendance.removed',
        'subject_id' => $attendanceId,
    ]);
});
