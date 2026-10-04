<?php

use App\Models\ScholarshipType;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

function makeScholarshipType(array $attributes = []): ScholarshipType
{
    static $sequence = 0;
    $sequence++;

    return ScholarshipType::create([
        'scholarship' => $attributes['scholarship'] ?? "Scholarship {$sequence}",
        'target_beneficiary' => $attributes['target_beneficiary'] ?? null,
        'benefit' => $attributes['benefit'] ?? null,
        'amount' => $attributes['amount'] ?? null,
        'is_active' => $attributes['is_active'] ?? true,
    ]);
}

/**
 * Applications need an academic year, a youth profile, and a user to review them.
 */
function attachApplication(ScholarshipType $type): int
{
    $academicYearId = DB::table('academic_years')->insertGetId([
        'code' => 'AY-2026-2027-1ST',
        'name' => 'First Semester',
        'is_active' => 1,
    ]);

    $youthProfileId = DB::table('youth_profiles')->insertGetId([
        'email' => Str::lower(Str::random(10)).'@youth.test',
        'lname' => 'Dela Cruz',
        'fname' => 'Juan',
        'birth_date' => '2008-01-01',
        'password' => bcrypt('password'),
    ]);

    return DB::table('scholarship_applications')->insertGetId([
        'academic_year_id' => $academicYearId,
        'youth_profile_id' => $youthProfileId,
        'scholarship_type_id' => $type->id,
        'status' => 'pending',
    ]);
}

test('guests cannot reach the scholarship type endpoints', function () {
    $this->get('/admin/get-scholarship-types')->assertRedirect('/');
    $this->post('/admin/scholarship-types', [])->assertRedirect('/');
});

test('non admins are redirected away from the scholarship type endpoints', function () {
    $this->actingAs(makeUser('staff'));

    $this->get('/admin/get-scholarship-types')->assertRedirect();
    $this->post('/admin/scholarship-types', ['scholarship' => 'STEM'])->assertRedirect();
});

test('admins can list scholarship types and search across the text fields', function () {
    $this->actingAs(makeUser('admin'));
    makeScholarshipType(['scholarship' => 'STEM Scholarship', 'target_beneficiary' => 'Senior high students']);
    makeScholarshipType(['scholarship' => 'Sports Grant', 'benefit' => 'Free training']);

    $this->getJson('/admin/get-scholarship-types')
        ->assertOk()
        ->assertJsonPath('total', 2)
        ->assertJsonPath('data.0.scholarship', 'Sports Grant');

    $this->getJson('/admin/get-scholarship-types?search=senior')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.scholarship', 'STEM Scholarship');

    $this->getJson('/admin/get-scholarship-types?search=training')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.scholarship', 'Sports Grant');
});

test('the listing includes an application count per row', function () {
    $this->actingAs(makeUser('admin'));
    $busy = makeScholarshipType(['scholarship' => 'Busy program']);
    makeScholarshipType(['scholarship' => 'Quiet program']);
    attachApplication($busy);

    $response = $this->getJson('/admin/get-scholarship-types')->assertOk();

    // The admin table shows this count, and it drives the "cannot delete" guard.
    // The listing is ordered by id descending, so the program created last comes first.
    $response->assertJsonPath('data.0.scholarship', 'Quiet program')
        ->assertJsonPath('data.0.applications_count', 0)
        ->assertJsonPath('data.1.scholarship', 'Busy program')
        ->assertJsonPath('data.1.applications_count', 1);
});

test('the requested page size is clamped to a sane range', function () {
    $this->actingAs(makeUser('admin'));
    makeScholarshipType();

    $this->getJson('/admin/get-scholarship-types?perpage=100000')->assertOk()->assertJsonPath('per_page', 100);
    $this->getJson('/admin/get-scholarship-types?perpage=0')->assertOk()->assertJsonPath('per_page', 1);
    $this->getJson('/admin/get-scholarship-types?perpage=abc')->assertOk()->assertJsonPath('per_page', 1);
});

test('admins can filter the list by availability', function () {
    $this->actingAs(makeUser('admin'));
    makeScholarshipType(['scholarship' => 'Open one', 'is_active' => true]);
    makeScholarshipType(['scholarship' => 'Closed one', 'is_active' => false]);

    $this->getJson('/admin/get-scholarship-types?status=active')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.scholarship', 'Open one');

    $this->getJson('/admin/get-scholarship-types?status=inactive')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.scholarship', 'Closed one');

    // Anything unexpected falls back to the unfiltered list.
    $this->getJson('/admin/get-scholarship-types?status=nonsense')->assertOk()->assertJsonPath('total', 2);
});

test('admins can create a scholarship type', function () {
    $this->actingAs(makeUser('admin'));

    $this->postJson('/admin/scholarship-types', [
        'scholarship' => 'STEM Scholarship',
        'target_beneficiary' => 'Senior high school students',
        'benefit' => 'Tuition, books, and a monthly allowance',
        'amount' => 25000,
        'is_active' => true,
    ])
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.is_active', true);

    $this->assertDatabaseHas('scholarship_types', [
        'scholarship' => 'STEM Scholarship',
        'target_beneficiary' => 'Senior high school students',
    ]);
});

test('a scholarship type can be created as closed', function () {
    $this->actingAs(makeUser('admin'));

    // `required` would reject false here, so the rule must be `present`.
    $this->postJson('/admin/scholarship-types', [
        'scholarship' => 'Not open yet',
        'is_active' => false,
    ])
        ->assertCreated()
        ->assertJsonPath('data.is_active', false);

    $this->assertDatabaseHas('scholarship_types', ['scholarship' => 'Not open yet', 'is_active' => false]);
});

test('creating a scholarship type validates the payload', function () {
    $this->actingAs(makeUser('admin'));
    makeScholarshipType(['scholarship' => 'STEM Scholarship']);

    $this->postJson('/admin/scholarship-types', ['scholarship' => 'STEM Scholarship', 'is_active' => true])
        ->assertStatus(422)
        ->assertJsonValidationErrors('scholarship');

    $this->postJson('/admin/scholarship-types', ['is_active' => true])
        ->assertStatus(422)
        ->assertJsonValidationErrors('scholarship');

    $this->postJson('/admin/scholarship-types', ['scholarship' => 'Negative', 'amount' => -1, 'is_active' => true])
        ->assertStatus(422)
        ->assertJsonValidationErrors('amount');

    $this->postJson('/admin/scholarship-types', ['scholarship' => 'Missing flag'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('is_active');
});

test('admins can update a scholarship type', function () {
    $this->actingAs(makeUser('admin'));
    $type = makeScholarshipType(['scholarship' => 'Sports Grant', 'is_active' => true]);

    $this->putJson("/admin/scholarship-types/{$type->id}", [
        'scholarship' => 'Sports and Wellness Grant',
        'target_beneficiary' => 'Athlete scholars',
        'benefit' => 'Free training and equipment',
        'amount' => 15000.5,
        'is_active' => false,
    ])
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.is_active', false);

    $this->assertDatabaseHas('scholarship_types', [
        'id' => $type->id,
        'scholarship' => 'Sports and Wellness Grant',
        'is_active' => false,
    ]);
});

test('clearing the optional fields on update does not error', function () {
    $this->actingAs(makeUser('admin'));
    $type = makeScholarshipType(['scholarship' => 'Sports Grant', 'target_beneficiary' => 'Athletes', 'benefit' => 'Kits']);

    // Only the required fields are sent; the rest must clear instead of throwing.
    $this->putJson("/admin/scholarship-types/{$type->id}", [
        'scholarship' => 'Sports Grant',
        'is_active' => true,
    ])
        ->assertOk()
        ->assertJsonPath('data.target_beneficiary', null)
        ->assertJsonPath('data.benefit', null)
        ->assertJsonPath('data.amount', null);
});

test('updating a scholarship type rejects a name already in use', function () {
    $this->actingAs(makeUser('admin'));
    makeScholarshipType(['scholarship' => 'STEM Scholarship']);
    $type = makeScholarshipType(['scholarship' => 'Sports Grant']);

    $this->putJson("/admin/scholarship-types/{$type->id}", ['scholarship' => 'STEM Scholarship', 'is_active' => true])
        ->assertStatus(422)
        ->assertJsonValidationErrors('scholarship');

    $this->putJson("/admin/scholarship-types/{$type->id}", ['scholarship' => 'Sports Grant', 'is_active' => true])->assertOk();

    $this->putJson('/admin/scholarship-types/999999', ['scholarship' => 'Ghost', 'is_active' => true])->assertNotFound();
});

test('admins can open and close a scholarship type', function () {
    $this->actingAs(makeUser('admin'));
    $type = makeScholarshipType(['is_active' => true]);

    $this->postJson("/admin/scholarship-types/{$type->id}/active", ['is_active' => false])
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.is_active', false);

    $this->assertFalse($type->fresh()->is_active);

    $this->postJson("/admin/scholarship-types/{$type->id}/active", ['is_active' => true])
        ->assertOk()
        ->assertJsonPath('data.is_active', true);

    $this->postJson("/admin/scholarship-types/{$type->id}/active", [])->assertStatus(422)->assertJsonValidationErrors('is_active');
    $this->postJson('/admin/scholarship-types/999999/active', ['is_active' => true])->assertNotFound();
});

test('admins can delete a scholarship type without applications', function () {
    $this->actingAs(makeUser('admin'));
    $type = makeScholarshipType();

    $this->deleteJson("/admin/scholarship-types/{$type->id}")
        ->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseMissing('scholarship_types', ['id' => $type->id]);

    $this->deleteJson('/admin/scholarship-types/999999')->assertNotFound();
});

test('a scholarship type with applications cannot be deleted', function () {
    $this->actingAs(makeUser('admin'));
    $type = makeScholarshipType(['scholarship' => 'STEM Scholarship']);
    $applicationId = attachApplication($type);

    // Without the guard the cascade would silently erase applicant records.
    $this->deleteJson("/admin/scholarship-types/{$type->id}")
        ->assertStatus(422)
        ->assertJsonPath('success', false);

    $this->assertDatabaseHas('scholarship_types', ['id' => $type->id]);
    $this->assertDatabaseHas('scholarship_applications', ['id' => $applicationId]);

    // Closing it is the supported alternative.
    $this->postJson("/admin/scholarship-types/{$type->id}/active", ['is_active' => false])->assertOk();
});
