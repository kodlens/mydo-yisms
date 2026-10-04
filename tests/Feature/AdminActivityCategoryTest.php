<?php

use App\Models\ActivityCategory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

function makeCategory(array $attributes = []): ActivityCategory
{
    static $sequence = 0;
    $sequence++;

    return ActivityCategory::create([
        'name' => $attributes['name'] ?? "Category {$sequence}",
        'slug' => $attributes['slug'] ?? "category-{$sequence}",
        'description' => $attributes['description'] ?? null,
        'is_active' => $attributes['is_active'] ?? true,
    ]);
}

function attachActivity(ActivityCategory $category): int
{
    return DB::table('activities')->insertGetId([
        'activity_category_id' => $category->id,
        'title' => 'Community Cleanup',
        'slug' => 'community-cleanup-'.Str::lower(Str::random(6)),
        'description' => 'A short description of the activity.',
        'venue_name' => 'Barangay Hall',
        'starts_at' => now(),
        'ends_at' => now()->addDay(),
        'status' => 'draft',
    ]);
}

test('guests cannot reach the activity category endpoints', function () {
    $this->get('/admin/get-activity-categories')->assertRedirect('/');
    $this->post('/admin/activity-categories', [])->assertRedirect('/');
});

test('non admins are redirected away from the activity category endpoints', function () {
    $this->actingAs(makeUser('staff'));

    $this->get('/admin/get-activity-categories')->assertRedirect();
    $this->post('/admin/activity-categories', ['name' => 'Sports'])->assertRedirect();
});

test('admins can list categories and search by name or slug', function () {
    $this->actingAs(makeUser('admin'));
    makeCategory(['name' => 'Leadership', 'slug' => 'leadership']);
    makeCategory(['name' => 'Environment', 'slug' => 'environment']);

    $this->get('/admin/get-activity-categories')
        ->assertOk()
        ->assertJsonPath('total', 2)
        ->assertJsonPath('data.0.name', 'Environment');

    $this->getJson('/admin/get-activity-categories?search=leader')
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.slug', 'leadership');
});

test('admins can create a category and the slug is generated', function () {
    $this->actingAs(makeUser('admin'));

    $this->postJson('/admin/activity-categories', [
        'name' => 'Skills & Learning',
        'description' => 'Workshops and training opportunities.',
        'is_active' => false,
    ])
        ->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.slug', 'skills-learning')
        ->assertJsonPath('data.is_active', false);

    $this->assertDatabaseHas('activity_categories', [
        'name' => 'Skills & Learning',
        'slug' => 'skills-learning',
        'is_active' => false,
    ]);
});

test('the slug is made unique when the requested one is taken', function () {
    $this->actingAs(makeUser('admin'));

    $this->postJson('/admin/activity-categories', ['name' => 'Sports', 'is_active' => true])
        ->assertCreated()
        ->assertJsonPath('data.slug', 'sports');

    // Both names slugify to "sports", so the second one gets a counter suffix.
    $this->postJson('/admin/activity-categories', ['name' => 'Sports!', 'is_active' => true])
        ->assertCreated()
        ->assertJsonPath('data.slug', 'sports-2');

    $this->postJson('/admin/activity-categories', ['name' => 'Sports.', 'is_active' => true])
        ->assertCreated()
        ->assertJsonPath('data.slug', 'sports-3');
});

test('creating a category validates the payload', function () {
    $this->actingAs(makeUser('admin'));
    makeCategory(['name' => 'Sports', 'slug' => 'sports']);

    $this->postJson('/admin/activity-categories', ['name' => 'Sports', 'is_active' => true])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');

    $this->postJson('/admin/activity-categories', ['is_active' => true])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');

    // is_active must be sent, but false is a valid value.
    $this->postJson('/admin/activity-categories', ['name' => 'Community'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('is_active');
});

test('admins can update a category', function () {
    $this->actingAs(makeUser('admin'));
    $category = makeCategory(['name' => 'Sports', 'slug' => 'sports', 'is_active' => true]);

    $this->putJson("/admin/activity-categories/{$category->id}", [
        'name' => 'Sports & Recreation',
        'description' => 'Sports and active lifestyle activities.',
        'is_active' => false,
    ])
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.slug', 'sports-recreation')
        ->assertJsonPath('data.is_active', false);

    $this->assertDatabaseHas('activity_categories', [
        'id' => $category->id,
        'name' => 'Sports & Recreation',
        'is_active' => false,
    ]);
});

test('updating a category rejects a name already used by another category', function () {
    $this->actingAs(makeUser('admin'));
    makeCategory(['name' => 'Sports', 'slug' => 'sports']);
    $category = makeCategory(['name' => 'Community', 'slug' => 'community']);

    $this->putJson("/admin/activity-categories/{$category->id}", [
        'name' => 'Sports',
        'is_active' => true,
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');

    // Saving without changing the name stays valid.
    $this->putJson("/admin/activity-categories/{$category->id}", [
        'name' => 'Community',
        'is_active' => true,
    ])->assertOk();

    $this->putJson('/admin/activity-categories/999999', ['name' => 'Ghost', 'is_active' => true])->assertNotFound();
});

test('admins can set a category active or inactive', function () {
    $this->actingAs(makeUser('admin'));
    $category = makeCategory(['is_active' => true]);

    $this->postJson("/admin/activity-categories/{$category->id}/active", ['is_active' => false])
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.is_active', false);

    $this->assertFalse($category->fresh()->is_active);

    $this->postJson("/admin/activity-categories/{$category->id}/active", ['is_active' => true])
        ->assertOk()
        ->assertJsonPath('data.is_active', true);

    $this->postJson("/admin/activity-categories/{$category->id}/active", [])->assertStatus(422)->assertJsonValidationErrors('is_active');
});

test('admins can delete an unused category', function () {
    $this->actingAs(makeUser('admin'));
    $category = makeCategory();

    $this->deleteJson("/admin/activity-categories/{$category->id}")
        ->assertOk()
        ->assertJsonPath('success', true);

    $this->assertDatabaseMissing('activity_categories', ['id' => $category->id]);
});

test('a category used by activities cannot be deleted', function () {
    $this->actingAs(makeUser('admin'));
    $category = makeCategory(['name' => 'Community']);
    attachActivity($category);

    $this->deleteJson("/admin/activity-categories/{$category->id}")
        ->assertStatus(422)
        ->assertJsonPath('success', false);

    $this->assertDatabaseHas('activity_categories', ['id' => $category->id]);
});

test('a category becomes deletable once its activities are gone', function () {
    $this->actingAs(makeUser('admin'));
    $category = makeCategory();
    $activityId = attachActivity($category);

    DB::table('activities')->where('id', $activityId)->delete();

    $this->deleteJson("/admin/activity-categories/{$category->id}")->assertOk();
    $this->assertDatabaseMissing('activity_categories', ['id' => $category->id]);
});
