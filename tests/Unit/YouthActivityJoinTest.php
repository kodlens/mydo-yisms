<?php

namespace Tests\Unit;

use App\Models\Activity;
use App\Models\YouthProfile;
use Database\Seeders\ActivitySeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Tests\TestCase;

class YouthActivityJoinTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        DB::purge('sqlite');
        Schema::create('users', fn (Blueprint $table) => $table->id());
        Schema::create('youth_profiles', fn (Blueprint $table) => $table->id());
        foreach (glob(database_path('migrations/2026_09_27_*.php')) as $file) {
            (require $file)->up();
        }
        $this->seed(ActivitySeeder::class);
        DB::table('youth_profiles')->insert([['id' => 1], ['id' => 2]]);
    }

    private function joinUrl(): string
    {
        return route('youth.youth-services.events-activities.join', 1);
    }

    public function test_join_is_immediate_uses_authenticated_youth_and_is_idempotent(): void
    {
        $this->actingAs(YouthProfile::find(1), 'youth');
        $this->post($this->joinUrl(), ['youth_profile_id' => 2, 'status' => 'pending'])
            ->assertRedirect(route('youth.youth-services.events-activities.index'));
        $this->assertDatabaseHas('activity_registrations', ['activity_id' => 1, 'youth_profile_id' => 1, 'status' => 'approved']);
        $this->post($this->joinUrl())->assertSessionHasNoErrors();
        $this->assertDatabaseCount('activity_registrations', 1);
        $this->getJson(route('youth.youth-services.events-activities.index'), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => Inertia::getVersion(),
        ])
            ->assertOk()->assertJsonPath('props.activities.0.has_joined', true)
            ->assertJsonPath('props.activities.0.participants_count', 1);
    }

    public function test_last_slot_cannot_be_taken_by_another_youth(): void
    {
        DB::table('activities')->where('id', 1)->update(['capacity' => 1]);
        $this->actingAs(YouthProfile::find(1), 'youth')->post($this->joinUrl())->assertSessionHasNoErrors();
        $this->actingAs(YouthProfile::find(2), 'youth')->post($this->joinUrl())->assertSessionHasErrors('activity');
        $this->assertDatabaseCount('activity_registrations', 1);
    }

    public function test_unavailable_activities_cannot_be_joined(): void
    {
        $this->actingAs(YouthProfile::find(1), 'youth');
        $original = (array) DB::table('activities')->where('id', 1)->first();
        foreach ([
            ['status' => 'draft'],
            ['status' => 'cancelled'],
            ['status' => 'archived'],
            ['published_at' => null],
            ['published_at' => now('UTC')->addDay()],
            ['registration_opens_at' => now('UTC')->addDay()],
            ['registration_closes_at' => now('UTC')],
            ['starts_at' => now('UTC')],
            ['ends_at' => now('UTC')],
            ['requires_registration' => false],
            ['capacity' => 0],
        ] as $changes) {
            DB::table('activities')->where('id', 1)->update(array_merge($original, $changes));
            $this->post($this->joinUrl())->assertSessionHasErrors('activity');
            $this->assertDatabaseCount('activity_registrations', 0);
        }
        DB::table('activities')->where('id', 1)->update($original);
        DB::table('activity_categories')->where('id', Activity::find(1)->activity_category_id)->update(['is_active' => false]);
        $this->post($this->joinUrl())->assertSessionHasErrors('activity');
        $this->assertDatabaseCount('activity_registrations', 0);
    }

    public function test_unlimited_activity_allows_joining_and_guests_cannot_join(): void
    {
        $this->postJson($this->joinUrl())->assertUnauthorized();
        $this->assertDatabaseCount('activity_registrations', 0);
        DB::table('activities')->where('id', 1)->update(['capacity' => null]);
        foreach ([1, 2] as $id) {
            $this->actingAs(YouthProfile::find($id), 'youth')->post($this->joinUrl())->assertSessionHasNoErrors();
        }
        $this->assertDatabaseCount('activity_registrations', 2);
    }
}
