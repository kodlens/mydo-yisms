<?php

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\Barangay;
use App\Models\SkActivityEvidence;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Support\Str;

test('staff sk registration requires sk position and barangay address fields', function () {
    $staff = makeUser('staff');
    $this->actingAs($staff);

    $response = $this->postJson('/staff/sk-officials', [
        'username' => 'sk_missing_' . Str::random(5),
        'email' => 'sk_missing_' . Str::random(5) . '@example.test',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
        'lname' => 'Bautista',
        'fname' => 'Carlo',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['sk_position', 'provCode', 'citymunCode', 'brgyCode']);
});

test('staff can register, search by barangay, and update sk official with address and position', function () {
    $staff = makeUser('staff');
    $this->actingAs($staff);

    $barangays = Barangay::take(2)->get();
    $firstBrgy = $barangays->first();
    $secondBrgy = $barangays->last();

    $username = 'sk_' . Str::lower(Str::random(6));
    $email = $username . '@example.test';

    $storeRes = $this->postJson('/staff/sk-officials', [
        'username' => $username,
        'email' => $email,
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
        'lname' => 'Mendoza',
        'fname' => 'Katrina',
        'mname' => 'Lopez',
        'sk_position' => 'SK Chairperson',
        'provCode' => $firstBrgy->provCode,
        'citymunCode' => $firstBrgy->citymunCode,
        'brgyCode' => $firstBrgy->brgyCode,
        'street_address' => 'Purok 1, Barangay Hall',
    ]);

    $storeRes->assertOk()->assertJsonPath('success', true);

    $skUser = User::where('username', $username)->firstOrFail();
    expect($skUser->role)->toBe('sk');
    expect($skUser->sk_position)->toBe('SK Chairperson');
    expect((string) $skUser->brgyCode)->toBe((string) $firstBrgy->brgyCode);
    expect($skUser->street_address)->toBe('Purok 1, Barangay Hall');

    // Search by barangay description returns the SK official with eager-loaded barangay
    $listRes = $this->getJson('/staff/get-sk-officials?search=' . urlencode($firstBrgy->brgyDesc));
    $listRes->assertOk();
    $found = collect($listRes->json('data'))->firstWhere('id', $skUser->id);
    expect($found)->not->toBeNull();
    expect($found['barangay']['brgyDesc'])->toBe($firstBrgy->brgyDesc);

    // Update SK official to another barangay & position
    $updateRes = $this->putJson("/staff/sk-officials/{$skUser->id}", [
        'username' => $username,
        'email' => $email,
        'lname' => 'Mendoza',
        'fname' => 'Katrina',
        'sk_position' => 'SK Kagawad',
        'provCode' => $secondBrgy->provCode,
        'citymunCode' => $secondBrgy->citymunCode,
        'brgyCode' => $secondBrgy->brgyCode,
        'street_address' => 'Purok 3',
    ]);

    $updateRes->assertOk()->assertJsonPath('success', true);
    expect($skUser->fresh()->sk_position)->toBe('SK Kagawad');
    expect((string) $skUser->fresh()->brgyCode)->toBe((string) $secondBrgy->brgyCode);
});

test('admin user creation conditionally requires barangay only when role is sk', function () {
    $admin = makeUser('admin');
    $this->actingAs($admin);

    // Creating a staff user works without barangay
    $staffUsername = 'staff_' . Str::lower(Str::random(6));
    $this->postJson('/admin/users', [
        'username' => $staffUsername,
        'email' => $staffUsername . '@example.test',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
        'lname' => 'Ramos',
        'fname' => 'Liza',
        'role' => 'staff',
    ])->assertOk()->assertJsonPath('status', 'saved');

    // Creating an SK user without barangay fails validation
    $skUsername = 'admin_sk_' . Str::lower(Str::random(6));
    $this->postJson('/admin/users', [
        'username' => $skUsername,
        'email' => $skUsername . '@example.test',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
        'lname' => 'Garcia',
        'fname' => 'Marco',
        'role' => 'sk',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['sk_position', 'provCode', 'citymunCode', 'brgyCode']);

    // Creating an SK user with barangay succeeds
    $brgy = Barangay::firstOrFail();
    $this->postJson('/admin/users', [
        'username' => $skUsername,
        'email' => $skUsername . '@example.test',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
        'lname' => 'Garcia',
        'fname' => 'Marco',
        'role' => 'sk',
        'sk_position' => 'SK Chairperson',
        'provCode' => $brgy->provCode,
        'citymunCode' => $brgy->citymunCode,
        'brgyCode' => $brgy->brgyCode,
        'street_address' => 'Purok 2',
    ])->assertOk()->assertJsonPath('status', 'saved');

    $this->assertDatabaseHas('users', [
        'username' => $skUsername,
        'role' => 'sk',
        'sk_position' => 'SK Chairperson',
        'brgyCode' => $brgy->brgyCode,
    ]);
});

test('sk dashboard and event evidences reflect assigned barangay and position of sk user', function () {
    $brgy = Barangay::firstOrFail();

    $skUser = User::create([
        'username' => 'sk_chair_' . Str::lower(Str::random(6)),
        'email' => 'sk_chair_' . Str::lower(Str::random(6)) . '@example.test',
        'password' => bcrypt('password'),
        'lname' => 'Navarro',
        'fname' => 'Andrea',
        'role' => 'sk',
        'sk_position' => 'SK Chairperson',
        'provCode' => $brgy->provCode,
        'citymunCode' => $brgy->citymunCode,
        'brgyCode' => $brgy->brgyCode,
    ]);

    YouthProfile::create([
        'email' => 'brgy_youth_' . Str::lower(Str::random(6)) . '@example.test',
        'lname' => 'Flores',
        'fname' => 'Kevin',
        'password' => bcrypt('password'),
        'role' => 'youth',
        'status' => 'approved',
        'provCode' => $brgy->provCode,
        'citymunCode' => $brgy->citymunCode,
        'brgyCode' => $brgy->brgyCode,
        'is_active' => true,
    ]);

    // SK Dashboard shows assigned barangay
    $this->actingAs($skUser)->get('/sk/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('sk/sk-dashboard-page')
            ->where('profile.sk_position', 'SK Chairperson')
            ->where('profile.barangay.brgyDesc', $brgy->brgyDesc)
        );

    // Event evidence endpoints in Staff & Admin show the SK Official's assigned barangay
    $category = ActivityCategory::firstOrCreate(
        ['slug' => 'barangay-outreach'],
        ['name' => 'Barangay Outreach', 'slug' => 'barangay-outreach', 'is_active' => true]
    );

    $activity = Activity::create([
        'activity_category_id' => $category->id,
        'title' => 'Clean and Green Drive',
        'slug' => 'clean-and-green-' . Str::lower(Str::random(6)),
        'description' => 'Barangay cleanup activity.',
        'venue_name' => 'Barangay Plaza',
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDay()->addHours(3),
        'requires_registration' => false,
        'requires_approval' => false,
        'status' => 'published',
        'published_at' => now()->subHour(),
    ]);

    SkActivityEvidence::create([
        'activity_id' => $activity->id,
        'user_id' => $skUser->id,
        'description' => 'Completed coastal and street cleanup with youth volunteers.',
        'photos' => ['upfiles/sk-evidences/sample.jpg'],
    ]);

    $staff = makeUser('staff');
    $this->actingAs($staff)
        ->getJson("/staff/events-activities/{$activity->id}/sk-evidences")
        ->assertOk()
        ->assertJsonPath('evidences.0.sk_official.sk_position', 'SK Chairperson')
        ->assertJsonPath('evidences.0.sk_official.barangay', $brgy->brgyDesc);

    $admin = makeUser('admin');
    $this->actingAs($admin)
        ->getJson("/admin/events-activities/{$activity->id}/sk-evidences")
        ->assertOk()
        ->assertJsonPath('evidences.0.sk_official.sk_position', 'SK Chairperson')
        ->assertJsonPath('evidences.0.sk_official.barangay', $brgy->brgyDesc);
});
