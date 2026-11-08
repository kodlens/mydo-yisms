<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StaffEventActivityFeaturedTest extends TestCase
{
    protected User $staff;
    protected ActivityCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->staff = User::create([
            'fname' => 'Staff',
            'lname' => 'EventTester',
            'mname' => 'E',
            'sex' => 'Female',
            'username' => 'staff_event_' . uniqid(),
            'email' => 'staff_event_' . uniqid() . '@example.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
        ]);

        $this->category = ActivityCategory::firstOrCreate(
            ['slug' => 'leadership-test'],
            ['name' => 'Leadership Test', 'is_active' => true]
        );
    }

    public function test_setting_activity_as_featured_unfeatures_other_activities_on_update(): void
    {
        $activity1 = Activity::create([
            'activity_category_id' => $this->category->id,
            'title' => 'First Event ' . uniqid(),
            'slug' => 'first-event-' . uniqid(),
            'description' => 'Description 1',
            'venue_name' => 'Hall A',
            'starts_at' => now()->addDays(5),
            'ends_at' => now()->addDays(5)->addHours(3),
            'status' => 'published',
            'is_featured' => true,
            'requires_registration' => false,
            'requires_approval' => false,
            'created_by' => $this->staff->id,
        ]);

        $activity2 = Activity::create([
            'activity_category_id' => $this->category->id,
            'title' => 'Second Event ' . uniqid(),
            'slug' => 'second-event-' . uniqid(),
            'description' => 'Description 2',
            'venue_name' => 'Hall B',
            'starts_at' => now()->addDays(10),
            'ends_at' => now()->addDays(10)->addHours(3),
            'status' => 'published',
            'is_featured' => false,
            'requires_registration' => false,
            'requires_approval' => false,
            'created_by' => $this->staff->id,
        ]);

        $this->assertTrue((bool) $activity1->fresh()->is_featured);
        $this->assertFalse((bool) $activity2->fresh()->is_featured);

        // Update activity2 to be featured
        $response = $this->actingAs($this->staff)->putJson("/staff/events-activities/{$activity2->id}", [
            'activity_category_id' => $this->category->id,
            'title' => $activity2->title,
            'description' => $activity2->description,
            'venue_name' => $activity2->venue_name,
            'starts_at' => $activity2->starts_at->toDateTimeString(),
            'ends_at' => $activity2->ends_at->toDateTimeString(),
            'status' => 'published',
            'is_featured' => true,
            'requires_registration' => false,
            'requires_approval' => false,
        ]);

        $response->assertStatus(200);

        // Activity 2 is now featured, Activity 1 must be un-featured
        $this->assertTrue((bool) $activity2->fresh()->is_featured);
        $this->assertFalse((bool) $activity1->fresh()->is_featured);
    }

    public function test_staff_can_toggle_featured_status(): void
    {
        $activity1 = Activity::create([
            'activity_category_id' => $this->category->id,
            'title' => 'Toggle Event 1 ' . uniqid(),
            'slug' => 'toggle-event-1-' . uniqid(),
            'description' => 'Description 1',
            'venue_name' => 'Hall A',
            'starts_at' => now()->addDays(5),
            'ends_at' => now()->addDays(5)->addHours(3),
            'status' => 'published',
            'is_featured' => true,
            'requires_registration' => false,
            'requires_approval' => false,
            'created_by' => $this->staff->id,
        ]);

        $activity2 = Activity::create([
            'activity_category_id' => $this->category->id,
            'title' => 'Toggle Event 2 ' . uniqid(),
            'slug' => 'toggle-event-2-' . uniqid(),
            'description' => 'Description 2',
            'venue_name' => 'Hall B',
            'starts_at' => now()->addDays(10),
            'ends_at' => now()->addDays(10)->addHours(3),
            'status' => 'published',
            'is_featured' => false,
            'requires_registration' => false,
            'requires_approval' => false,
            'created_by' => $this->staff->id,
        ]);

        // Toggle activity2 to featured
        $response = $this->actingAs($this->staff)->postJson("/staff/events-activities/{$activity2->id}/toggle-featured");
        $response->assertStatus(200);
        $response->assertJson(['is_featured' => true, 'success' => true]);

        $this->assertTrue((bool) $activity2->fresh()->is_featured);
        $this->assertFalse((bool) $activity1->fresh()->is_featured);

        // Toggle activity2 again to un-feature
        $response2 = $this->actingAs($this->staff)->postJson("/staff/events-activities/{$activity2->id}/toggle-featured");
        $response2->assertStatus(200);
        $response2->assertJson(['is_featured' => false, 'success' => true]);

        $this->assertFalse((bool) $activity2->fresh()->is_featured);
    }
}
