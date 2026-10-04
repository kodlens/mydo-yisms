<?php

use App\Models\ActivityCategory;
use App\Models\User;
use App\Models\Volunteer;
use App\Models\VolunteerActivity;
use App\Models\YouthProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

function makeYouth(array $attributes = []): YouthProfile
{
    static $sequence = 0;
    $sequence++;

    return YouthProfile::create([
        'email' => $attributes['email'] ?? "youth{$sequence}@example.test",
        'lname' => $attributes['lname'] ?? 'Dela Cruz',
        'fname' => $attributes['fname'] ?? 'Juan',
        'school_name' => $attributes['school_name'] ?? 'E-Kabataan National High School',
        'password' => bcrypt('password'),
    ]);
}

function makeVolunteer(array $attributes = []): Volunteer
{
    $profile = $attributes['youth_profile'] ?? makeYouth();

    return Volunteer::create([
        'youth_profile_id' => $profile->id,
        'status' => $attributes['status'] ?? 'active',
        'motivation' => $attributes['motivation'] ?? null,
        'skills' => $attributes['skills'] ?? null,
        'availability' => $attributes['availability'] ?? null,
        'registered_at' => now(),
    ]);
}

function makeActivity(array $attributes = []): \App\Models\Activity
{
    static $sequence = 0;
    $sequence++;

    $categoryId = ActivityCategory::firstOrCreate(
        ['slug' => 'community'],
        ['name' => 'Community', 'slug' => 'community', 'is_active' => true],
    )->id;

    return \App\Models\Activity::create(array_merge([
        'activity_category_id' => $categoryId,
        'title' => "Activity {$sequence}",
        'slug' => "activity-{$sequence}-".Str::lower(Str::random(4)),
        'description' => 'A community activity.',
        'venue_name' => 'Barangay Hall',
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDay()->addHours(4),
        'status' => 'published',
    ], $attributes));
}

test('guests cannot reach the volunteer endpoints', function () {
    $this->get('/admin/get-volunteers')->assertRedirect('/');
    $this->post('/admin/volunteers', [])->assertRedirect('/');
    $this->post('/youth/services/volunteer', [])->assertRedirect('/');
});

test('non admins are redirected away from the volunteer endpoints', function () {
    $this->actingAs(makeUser('staff'));

    $this->get('/admin/get-volunteers')->assertRedirect();
    $this->post('/admin/volunteers', ['email' => 'someone@example.test'])->assertRedirect();
});

test('admins can list volunteers and search across the youth record', function () {
    $this->actingAs(makeUser('admin'));
    makeVolunteer(['skills' => 'First aid', 'youth_profile' => makeYouth(['fname' => 'Maria', 'lname' => 'Santos'])]);
    makeVolunteer(['skills' => 'Driving', 'youth_profile' => makeYouth(['fname' => 'Pedro', 'lname' => 'Reyes'])]);

    $this->getJson('/admin/get-volunteers')
        ->assertOk()
        ->assertJsonPath('total', 2);

    $this->getJson('/admin/get-volunteers?search=santos')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.lname', 'Santos');

    $this->getJson('/admin/get-volunteers?search=driving')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.skills', 'Driving');
});

test('admins can filter volunteers by status and the page size is clamped', function () {
    $this->actingAs(makeUser('admin'));
    makeVolunteer(['status' => 'active']);
    makeVolunteer(['status' => 'pending']);
    makeVolunteer(['status' => 'inactive']);

    $this->getJson('/admin/get-volunteers?status=active')->assertOk()->assertJsonPath('total', 1);
    $this->getJson('/admin/get-volunteers?status=pending')->assertOk()->assertJsonPath('total', 1);
    $this->getJson('/admin/get-volunteers?status=nonsense')->assertOk()->assertJsonPath('total', 3);

    $this->getJson('/admin/get-volunteers?perpage=100000')->assertOk()->assertJsonPath('per_page', 100);
    $this->getJson('/admin/get-volunteers?perpage=0')->assertOk()->assertJsonPath('per_page', 1);
});

test('admins can register a volunteer against an existing youth account', function () {
    $this->actingAs(makeUser('admin'));
    $profile = makeYouth(['email' => 'maria@example.test']);

    $this->postJson('/admin/volunteers', [
        'email' => 'maria@example.test',
        'skills' => 'First aid',
        'availability' => 'Weekends',
        'status' => 'active',
    ])
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.status', 'active')
        ->assertJsonPath('data.youth_profile_id', $profile->id);

    $this->assertDatabaseHas('volunteers', ['youth_profile_id' => $profile->id, 'status' => 'active']);
});

test('registering a volunteer validates the youth account and prevents duplicates', function () {
    $this->actingAs(makeUser('admin'));
    makeYouth(['email' => 'maria@example.test']);

    // The youth must already have an account.
    $this->postJson('/admin/volunteers', ['email' => 'nobody@example.test', 'status' => 'pending'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('email');

    $this->postJson('/admin/volunteers', ['status' => 'pending'])->assertStatus(422)->assertJsonValidationErrors('email');
    $this->postJson('/admin/volunteers', ['email' => 'maria@example.test', 'status' => 'retired'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('status');

    $this->postJson('/admin/volunteers', ['email' => 'maria@example.test', 'status' => 'pending'])->assertCreated();

    // A youth can only hold one volunteer record.
    $this->postJson('/admin/volunteers', ['email' => 'maria@example.test', 'status' => 'pending'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

test('youth can register themselves as a pending volunteer', function () {
    $profile = makeYouth();
    $this->actingAs($profile, 'youth');

    $this->postJson('/youth/services/volunteer', [
        'motivation' => 'I want to help my barangay stay clean.',
        'skills' => 'First aid',
        'emergency_contact_name' => 'Ana Dela Cruz',
        'emergency_contact_number' => '09171234567',
    ])
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.status', 'pending');

    $this->assertDatabaseHas('volunteers', ['youth_profile_id' => $profile->id, 'status' => 'pending']);
});

test('youth volunteer registration validates the form and blocks duplicates', function () {
    $profile = makeYouth();
    $this->actingAs($profile, 'youth');

    $this->postJson('/youth/services/volunteer', ['motivation' => 'short'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['motivation', 'emergency_contact_name', 'emergency_contact_number']);

    $this->postJson('/youth/services/volunteer', [
        'motivation' => 'I want to help my barangay stay clean.',
        'emergency_contact_name' => 'Ana Dela Cruz',
        'emergency_contact_number' => '09171234567',
    ])->assertCreated();

    $this->postJson('/youth/services/volunteer', [
        'motivation' => 'I want to help my barangay stay clean.',
        'emergency_contact_name' => 'Ana Dela Cruz',
        'emergency_contact_number' => '09171234567',
    ])->assertStatus(422);
});

test('youth see their own volunteer record, hours, and assignments', function () {
    $profile = makeYouth();
    $volunteer = makeVolunteer(['youth_profile' => $profile, 'status' => 'active']);
    $activity = makeActivity();
    $assignment = VolunteerActivity::create([
        'volunteer_id' => $volunteer->id,
        'activity_id' => $activity->id,
        'status' => 'completed',
    ]);
    DB::table('volunteer_attendance')->insert([
        'volunteer_activity_id' => $assignment->id,
        'hours_rendered' => 4.5,
        'method' => 'manual',
    ]);

    $this->actingAs($profile, 'youth')
        ->getJson('/youth/services/get-my-volunteering')
        ->assertOk()
        ->assertJsonPath('volunteer.status', 'active')
        ->assertJsonPath('volunteer.total_hours', 4.5)
        ->assertJsonPath('assignments.0.activity_title', $activity->title)
        ->assertJsonPath('assignments.0.hours_rendered', 4.5);
});

test('youth without a volunteer record get a null record rather than an error', function () {
    $profile = makeYouth();

    $this->actingAs($profile, 'youth')
        ->getJson('/youth/services/get-my-volunteering')
        ->assertOk()
        ->assertJsonPath('volunteer', null)
        ->assertJsonPath('assignments', []);
});

test('admins can approve a volunteer and the approver is stamped', function () {
    $admin = makeUser('admin');
    $this->actingAs($admin);
    $volunteer = makeVolunteer(['status' => 'pending']);

    $this->postJson("/admin/volunteers/{$volunteer->id}/status", ['status' => 'active'])
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.status', 'active');

    $fresh = $volunteer->fresh();
    $this->assertSame($admin->id, $fresh->approved_by);
    $this->assertNotNull($fresh->approved_at);

    $this->postJson("/admin/volunteers/{$volunteer->id}/status", ['status' => 'inactive'])->assertOk();
    $this->postJson("/admin/volunteers/{$volunteer->id}/status", ['status' => 'retired'])->assertStatus(422);
    $this->postJson("/admin/volunteers/{$volunteer->id}/status", [])->assertStatus(422)->assertJsonValidationErrors('status');
    $this->postJson('/admin/volunteers/999999/status', ['status' => 'active'])->assertNotFound();
});

test('admins can update a volunteer and clearing optional fields works', function () {
    $this->actingAs(makeUser('admin'));
    $volunteer = makeVolunteer(['skills' => 'Driving', 'motivation' => 'Wants to help']);

    $this->putJson("/admin/volunteers/{$volunteer->id}", [
        'skills' => 'Driving, First aid',
        'motivation' => '',
        'status' => 'active',
    ])
        ->assertOk()
        ->assertJsonPath('data.skills', 'Driving, First aid')
        // An empty string must clear the field rather than store a blank value.
        ->assertJsonPath('data.motivation', null);

    $this->putJson('/admin/volunteers/999999', ['status' => 'active'])->assertNotFound();
});

test('a volunteer cannot be assigned to the same activity twice', function () {
    $this->actingAs(makeUser('admin'));
    $volunteer = makeVolunteer();
    $activity = makeActivity();

    $this->postJson("/admin/volunteers/{$volunteer->id}/assignments", [
        'activity_id' => $activity->id,
        'role' => 'Team lead',
        'status' => 'assigned',
    ])->assertCreated();

    // Re-assigning updates the existing row rather than creating a duplicate.
    $this->postJson("/admin/volunteers/{$volunteer->id}/assignments", [
        'activity_id' => $activity->id,
        'role' => 'Member',
        'status' => 'assigned',
    ])->assertOk();

    $this->assertSame(1, VolunteerActivity::where('volunteer_id', $volunteer->id)->count());
    $this->assertDatabaseHas('volunteer_activities', ['volunteer_id' => $volunteer->id, 'role' => 'Member']);
});

test('assigning a volunteer validates the activity and status', function () {
    $this->actingAs(makeUser('admin'));
    $volunteer = makeVolunteer();

    $this->postJson("/admin/volunteers/{$volunteer->id}/assignments", ['status' => 'assigned'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('activity_id');

    $this->postJson("/admin/volunteers/{$volunteer->id}/assignments", ['activity_id' => 999999, 'status' => 'assigned'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('activity_id');

    $this->postJson("/admin/volunteers/{$volunteer->id}/assignments", ['activity_id' => makeActivity()->id])
        ->assertStatus(422)
        ->assertJsonValidationErrors('status');
});

test('attendance derives credited hours from the time in and time out', function () {
    $this->actingAs(makeUser('admin'));
    $volunteer = makeVolunteer();
    $assignment = VolunteerActivity::create([
        'volunteer_id' => $volunteer->id,
        'activity_id' => makeActivity()->id,
        'status' => 'assigned',
    ]);

    $this->postJson("/admin/volunteers/{$volunteer->id}/attendance", [
        'volunteer_activity_id' => $assignment->id,
        'time_in' => '2026-09-28T08:00:00',
        'time_out' => '2026-09-28T12:30:00',
        'method' => 'manual',
    ])
        ->assertCreated()
        ->assertJsonPath('success', true)
        // 4.5 hours from an 08:00 to 12:30 session.
        ->assertJsonPath('data.attendance.hours_rendered', 4.5);

    // Logging hours completes the assignment.
    $this->assertSame('completed', $assignment->fresh()->status);
});

test('attendance accepts an explicit hours value and re-logging updates the record', function () {
    $this->actingAs(makeUser('admin'));
    $volunteer = makeVolunteer();
    $assignment = VolunteerActivity::create([
        'volunteer_id' => $volunteer->id,
        'activity_id' => makeActivity()->id,
        'status' => 'assigned',
    ]);

    $this->postJson("/admin/volunteers/{$volunteer->id}/attendance", [
        'volunteer_activity_id' => $assignment->id,
        'hours_rendered' => 6,
        'method' => 'qr',
    ])->assertCreated()->assertJsonPath('data.attendance.hours_rendered', 6);

    // The unique index on volunteer_activity_id means this edits rather than duplicates.
    $this->postJson("/admin/volunteers/{$volunteer->id}/attendance", [
        'volunteer_activity_id' => $assignment->id,
        'hours_rendered' => 8,
        'method' => 'qr',
    ])->assertCreated();

    $this->assertSame(1, DB::table('volunteer_attendance')->where('volunteer_activity_id', $assignment->id)->count());
    $this->assertDatabaseHas('volunteer_attendance', ['volunteer_activity_id' => $assignment->id, 'hours_rendered' => 8]);
});

test('attendance validates the times, hours, and method', function () {
    $this->actingAs(makeUser('admin'));
    $volunteer = makeVolunteer();
    $assignment = VolunteerActivity::create([
        'volunteer_id' => $volunteer->id,
        'activity_id' => makeActivity()->id,
        'status' => 'assigned',
    ]);

    // A time out before the time in is rejected.
    $this->postJson("/admin/volunteers/{$volunteer->id}/attendance", [
        'volunteer_activity_id' => $assignment->id,
        'time_in' => '2026-09-28T12:00:00',
        'time_out' => '2026-09-28T08:00:00',
        'method' => 'manual',
    ])->assertStatus(422)->assertJsonValidationErrors('time_out');

    $this->postJson("/admin/volunteers/{$volunteer->id}/attendance", [
        'volunteer_activity_id' => $assignment->id,
        'hours_rendered' => 30,
        'method' => 'manual',
    ])->assertStatus(422)->assertJsonValidationErrors('hours_rendered');

    $this->postJson("/admin/volunteers/{$volunteer->id}/attendance", [
        'volunteer_activity_id' => $assignment->id,
        'method' => 'telepathy',
    ])->assertStatus(422)->assertJsonValidationErrors('method');

    // An assignment from another volunteer must not be reachable.
    $otherAssignment = VolunteerActivity::create([
        'volunteer_id' => makeVolunteer()->id,
        'activity_id' => makeActivity()->id,
        'status' => 'assigned',
    ]);

    $this->postJson("/admin/volunteers/{$volunteer->id}/attendance", [
        'volunteer_activity_id' => $otherAssignment->id,
        'method' => 'manual',
    ])->assertNotFound();
});

test('service hours aggregate across every assignment', function () {
    $this->actingAs(makeUser('admin'));
    $volunteer = makeVolunteer();

    foreach ([3, 2.5] as $hours) {
        $assignment = VolunteerActivity::create([
            'volunteer_id' => $volunteer->id,
            'activity_id' => makeActivity()->id,
            'status' => 'completed',
        ]);

        DB::table('volunteer_attendance')->insert([
            'volunteer_activity_id' => $assignment->id,
            'hours_rendered' => $hours,
            'method' => 'manual',
        ]);
    }

    $this->getJson('/admin/get-volunteers')
        ->assertOk()
        ->assertJsonPath('data.0.total_hours', 5.5)
        ->assertJsonPath('data.0.assignments_count', 2);
});

test('a volunteer with assignments or attendance cannot be deleted', function () {
    $this->actingAs(makeUser('admin'));
    $volunteer = makeVolunteer();

    $this->deleteJson("/admin/volunteers/{$volunteer->id}")->assertOk();
    $this->assertDatabaseMissing('volunteers', ['id' => $volunteer->id]);

    $assigned = makeVolunteer();
    VolunteerActivity::create([
        'volunteer_id' => $assigned->id,
        'activity_id' => makeActivity()->id,
        'status' => 'assigned',
    ]);

    $this->deleteJson("/admin/volunteers/{$assigned->id}")
        ->assertStatus(422)
        ->assertJsonPath('success', false);

    $this->assertDatabaseHas('volunteers', ['id' => $assigned->id]);
    $this->deleteJson('/admin/volunteers/999999')->assertNotFound();
});

test('an assignment with recorded attendance cannot be removed', function () {
    $this->actingAs(makeUser('admin'));
    $volunteer = makeVolunteer();
    $activity = makeActivity();
    $assignment = VolunteerActivity::create([
        'volunteer_id' => $volunteer->id,
        'activity_id' => $activity->id,
        'status' => 'assigned',
    ]);

    $this->deleteJson("/admin/volunteers/{$volunteer->id}/assignments/{$assignment->id}")
        ->assertOk()
        ->assertJsonPath('success', true);

    $second = VolunteerActivity::create([
        'volunteer_id' => $volunteer->id,
        'activity_id' => $activity->id,
        'status' => 'assigned',
    ]);
    DB::table('volunteer_attendance')->insert([
        'volunteer_activity_id' => $second->id,
        'hours_rendered' => 2,
        'method' => 'manual',
    ]);

    // Attendance cascades on delete, so refuse rather than erasing the service record.
    $this->deleteJson("/admin/volunteers/{$volunteer->id}/assignments/{$second->id}")
        ->assertStatus(422)
        ->assertJsonPath('success', false);

    $this->assertDatabaseHas('volunteer_activities', ['id' => $second->id]);
    $this->deleteJson("/admin/volunteers/{$volunteer->id}/assignments/999999")->assertNotFound();
});

test('the assignment sheet returns the volunteer with their assignments and activities', function () {
    $this->actingAs(makeUser('admin'));
    $volunteer = makeVolunteer(['skills' => 'First aid']);
    $activity = makeActivity(['title' => 'Tree Planting']);
    $assignment = VolunteerActivity::create([
        'volunteer_id' => $volunteer->id,
        'activity_id' => $activity->id,
        'role' => 'Team lead',
        'status' => 'assigned',
    ]);

    $this->getJson("/admin/volunteers/{$volunteer->id}/assignments")
        ->assertOk()
        ->assertJsonPath('volunteer.skills', 'First aid')
        ->assertJsonPath('assignments.0.activity_title', 'Tree Planting')
        ->assertJsonPath('assignments.0.role', 'Team lead')
        ->assertJsonPath('assignments.0.attendance', null)
        ->assertJsonPath('available_activities.0.id', $activity->id);

    $this->getJson('/admin/volunteers/999999/assignments')->assertNotFound();
});
