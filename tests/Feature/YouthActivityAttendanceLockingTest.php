<?php

use App\Models\Activity;
use App\Models\ActivityAttendance;
use App\Models\ActivityCategory;
use App\Models\ActivityRegistration;
use App\Models\YouthProfile;

function createLockingTestYouth(array $attributes = []): YouthProfile
{
    static $s = 0;
    $s++;

    return YouthProfile::create(array_merge([
        'email' => "youth.locking{$s}@example.test",
        'lname' => 'Reyes',
        'fname' => 'Jose',
        'student_id' => "STU-LOCK-{$s}",
        'password' => bcrypt('password'),
        'is_active' => true,
    ], $attributes));
}

function createLockingTestActivity(array $attributes = []): Activity
{
    static $s = 0;
    $s++;

    $categoryId = ActivityCategory::firstOrCreate(
        ['slug' => 'community'],
        ['name' => 'Community', 'slug' => 'community', 'is_active' => true]
    )->id;

    return Activity::create(array_merge([
        'activity_category_id' => $categoryId,
        'title' => "Tree Planting Activity {$s}",
        'slug' => "tree-planting-activity-{$s}",
        'description' => 'Community tree planting drive.',
        'venue_name' => 'Municipal Park',
        'starts_at' => now()->addDays(5),
        'ends_at' => now()->addDays(5)->addHours(3),
        'requires_registration' => true,
        'requires_approval' => false,
        'status' => 'published',
        'published_at' => now()->subDay(),
    ], $attributes));
}

test('youth profile automatically gets a secure non-sequential reference code', function () {
    $youth = createLockingTestYouth();

    $this->assertNotEmpty($youth->reference_code);
    $this->assertStringStartsWith('YD-', $youth->reference_code);
});

test('youth can view activities index with their personalized event pass info', function () {
    $youth = createLockingTestYouth();
    $this->actingAs($youth, 'youth');

    $activity = createLockingTestActivity();

    $response = $this->get('/youth/services/events-activities');

    $response->assertOk();
    $this->assertSame($youth->reference_code, $response->viewData('page')['props']['youthPass']['reference_code']);
});

test('registered youth can cancel participation before activity starts when not attended', function () {
    $youth = createLockingTestYouth();
    $this->actingAs($youth, 'youth');

    $activity = createLockingTestActivity(['starts_at' => now()->addDays(3)]);

    ActivityRegistration::create([
        'activity_id' => $activity->id,
        'youth_profile_id' => $youth->id,
        'status' => 'approved',
        'registered_at' => now(),
    ]);

    $response = $this->post("/youth/services/events-activities/{$activity->id}/cancel");

    $response->assertRedirect('/youth/services/events-activities');

    $this->assertDatabaseHas('activity_registrations', [
        'activity_id' => $activity->id,
        'youth_profile_id' => $youth->id,
        'status' => 'cancelled',
    ]);
});

test('cancellation is permanently disabled once attendance is recorded', function () {
    $youth = createLockingTestYouth();
    $this->actingAs($youth, 'youth');

    // Future activity (would normally be cancellable)
    $activity = createLockingTestActivity(['starts_at' => now()->addDays(3)]);

    $registration = ActivityRegistration::create([
        'activity_id' => $activity->id,
        'youth_profile_id' => $youth->id,
        'status' => 'approved',
        'registered_at' => now(),
    ]);

    // Record attendance early (e.g., early check-in or attendee present)
    ActivityAttendance::create([
        'activity_id' => $activity->id,
        'youth_profile_id' => $youth->id,
        'activity_registration_id' => $registration->id,
        'method' => 'qr',
        'attended_at' => now(),
    ]);

    // Attempting to cancel must be rejected by backend
    $response = $this->post("/youth/services/events-activities/{$activity->id}/cancel");

    $response->assertSessionHasErrors(['activity']);

    // Ensure registration is NOT cancelled in the database
    $this->assertDatabaseHas('activity_registrations', [
        'id' => $registration->id,
        'status' => 'approved',
        'cancelled_at' => null,
    ]);
});

test('cancellation is disabled once an activity officially starts', function () {
    $youth = createLockingTestYouth();
    $this->actingAs($youth, 'youth');

    // Activity that has already started 1 hour ago
    $activity = createLockingTestActivity([
        'starts_at' => now()->subHour(),
        'ends_at' => now()->addHours(2),
    ]);

    $registration = ActivityRegistration::create([
        'activity_id' => $activity->id,
        'youth_profile_id' => $youth->id,
        'status' => 'approved',
        'registered_at' => now()->subDays(2),
    ]);

    $response = $this->post("/youth/services/events-activities/{$activity->id}/cancel");

    $response->assertSessionHasErrors(['activity']);

    $this->assertDatabaseHas('activity_registrations', [
        'id' => $registration->id,
        'status' => 'approved',
        'cancelled_at' => null,
    ]);
});
