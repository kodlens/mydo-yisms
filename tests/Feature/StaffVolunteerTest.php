<?php

use App\Models\Volunteer;
use App\Models\VolunteerActivity;
use Illuminate\Support\Facades\DB;

test('guests cannot reach the staff volunteer endpoints', function () {
    $this->get('/staff/get-volunteers')->assertRedirect('/');
    $this->get('/staff/volunteers')->assertRedirect('/');

    // There is no POST on this path for staff, so the method is rejected before auth runs.
    $this->post('/staff/volunteers', [])->assertStatus(405);
});

test('admins are redirected away from the staff volunteer endpoints', function () {
    $this->actingAs(makeUser('admin'));

    $this->get('/staff/get-volunteers')->assertRedirect();
    $this->get('/staff/volunteers')->assertRedirect();
    $this->post('/staff/volunteers', [])->assertStatus(405);
});

test('staff can list volunteers with search and status filters', function () {
    $this->actingAs(makeUser('staff'));
    makeVolunteer(['skills' => 'First aid', 'status' => 'pending', 'youth_profile' => makeYouth(['lname' => 'Santos'])]);
    makeVolunteer(['skills' => 'Driving', 'status' => 'active', 'youth_profile' => makeYouth(['lname' => 'Reyes'])]);

    $this->getJson('/staff/get-volunteers')
        ->assertOk()
        ->assertJsonPath('total', 2);

    $this->getJson('/staff/get-volunteers?search=santos')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.lname', 'Santos');

    $this->getJson('/staff/get-volunteers?status=active')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.status', 'active');
});

test('staff can review a pending volunteer application', function () {
    $this->actingAs(makeUser('staff'));
    $volunteer = makeVolunteer(['status' => 'pending']);

    $this->postJson("/staff/volunteers/{$volunteer->id}/status", ['status' => 'active'])
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.status', 'active');

    $this->assertSame('active', $volunteer->fresh()->status);

    $this->postJson("/staff/volunteers/{$volunteer->id}/status", ['status' => 'inactive'])->assertOk();
    $this->postJson("/staff/volunteers/{$volunteer->id}/status", ['status' => 'retired'])->assertStatus(422);
    $this->postJson('/staff/volunteers/999999/status', ['status' => 'active'])->assertNotFound();
});

test('staff can update volunteer details but cannot register or delete volunteers', function () {
    $this->actingAs(makeUser('staff'));
    $volunteer = makeVolunteer(['skills' => 'Driving']);

    $this->putJson("/staff/volunteers/{$volunteer->id}", [
        'skills' => 'Driving, First aid',
        'status' => 'active',
    ])
        ->assertOk()
        ->assertJsonPath('data.skills', 'Driving, First aid');

    // Registration and deletion are admin-only, so those methods are not routed for staff.
    $this->postJson('/staff/volunteers', ['email' => 'new@example.test', 'status' => 'pending'])->assertStatus(405);
    $this->deleteJson("/staff/volunteers/{$volunteer->id}")->assertStatus(405);
});

test('staff can assign a volunteer and log attendance', function () {
    $this->actingAs(makeUser('staff'));
    $volunteer = makeVolunteer();
    $activity = makeActivity(['title' => 'Tree Planting']);

    $this->postJson("/staff/volunteers/{$volunteer->id}/assignments", [
        'activity_id' => $activity->id,
        'role' => 'Team lead',
        'status' => 'assigned',
    ])
        ->assertCreated()
        ->assertJsonPath('data.activity_title', 'Tree Planting');

    $assignment = VolunteerActivity::where('volunteer_id', $volunteer->id)->firstOrFail();

    $this->postJson("/staff/volunteers/{$volunteer->id}/attendance", [
        'volunteer_activity_id' => $assignment->id,
        'time_in' => '2026-09-28T08:00:00',
        'time_out' => '2026-09-28T11:00:00',
        'method' => 'manual',
    ])
        ->assertCreated()
        // 3 hours derived from the times.
        ->assertJsonPath('data.attendance.hours_rendered', 3);

    $this->getJson("/staff/volunteers/{$volunteer->id}/assignments")
        ->assertOk()
        ->assertJsonPath('assignments.0.activity_title', 'Tree Planting')
        ->assertJsonPath('assignments.0.attendance.hours_rendered', 3);

    $this->getJson('/staff/get-volunteers')
        ->assertOk()
        ->assertJsonPath('data.0.total_hours', 3)
        ->assertJsonPath('data.0.assignments_count', 1);
});

test('staff cannot log attendance against another volunteers assignment', function () {
    $this->actingAs(makeUser('staff'));
    $volunteer = makeVolunteer();
    $otherAssignment = VolunteerActivity::create([
        'volunteer_id' => makeVolunteer()->id,
        'activity_id' => makeActivity()->id,
        'status' => 'assigned',
    ]);

    $this->postJson("/staff/volunteers/{$volunteer->id}/attendance", [
        'volunteer_activity_id' => $otherAssignment->id,
        'method' => 'manual',
    ])->assertNotFound();
});

test('staff cannot remove an assignment that already has attendance', function () {
    $this->actingAs(makeUser('staff'));
    $volunteer = makeVolunteer();
    $assignment = VolunteerActivity::create([
        'volunteer_id' => $volunteer->id,
        'activity_id' => makeActivity()->id,
        'status' => 'completed',
    ]);
    DB::table('volunteer_attendance')->insert([
        'volunteer_activity_id' => $assignment->id,
        'hours_rendered' => 2,
        'method' => 'manual',
    ]);

    $this->deleteJson("/staff/volunteers/{$volunteer->id}/assignments/{$assignment->id}")
        ->assertStatus(422)
        ->assertJsonPath('success', false);

    $this->assertDatabaseHas('volunteer_activities', ['id' => $assignment->id]);
});
