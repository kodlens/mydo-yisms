<?php

namespace Tests\Unit;

use App\Http\Controllers\Youth\YouthEventActivitiyController;
use Carbon\CarbonImmutable;
use Database\Seeders\ActivitySeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class YouthActivityFeedTest extends TestCase
{
    public function test_feed_filters_public_activities_and_counts_reserved_slots(): void
    {
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        DB::purge('sqlite');
        Schema::create('users', fn (Blueprint $table) => $table->id());
        Schema::create('youth_profiles', fn (Blueprint $table) => $table->id());
        foreach (glob(database_path('migrations/2026_09_27_*.php')) as $file) {
            (require $file)->up();
        }
        $this->seed(ActivitySeeder::class);
        $first = DB::table('activities')->orderBy('id')->first();
        DB::table('activities')->where('id', $first->id)->update(['capacity' => 2]);
        foreach (['pending', 'approved', 'rejected', 'cancelled'] as $index => $status) {
            DB::table('youth_profiles')->insert(['id' => $index + 1]);
            DB::table('activity_registrations')->insert(['activity_id' => $first->id, 'youth_profile_id' => $index + 1, 'status' => $status]);
        }
        $request = Request::create('/youth/services/events-activities');
        $request->headers->set('X-Inertia', 'true');
        $feed = fn () => (new YouthEventActivitiyController)->index()->toResponse($request)->getData(true)['props']['activities'];
        $activities = $feed();
        $this->assertCount(5, $activities);
        $this->assertSame(2, $activities[0]['participants_count']);
        $this->assertSame(2, $activities[0]['capacity']);
        $this->assertSame('Leadership', $activities[0]['category']['name']);
        $this->assertSame('08:00', CarbonImmutable::parse($activities[0]['starts_at'])->setTimezone('Asia/Manila')->format('H:i'));
        $this->assertTrue($activities[0]['is_featured']);
        $this->assertNull($activities[4]['capacity']);

        $now = CarbonImmutable::now('UTC');
        DB::table('activities')->where('id', $activities[1]['id'])->update(['status' => 'draft']);
        DB::table('activities')->where('id', $activities[2]['id'])->update(['published_at' => $now->addDay()]);
        DB::table('activities')->where('id', $activities[3]['id'])->update(['ends_at' => $now->subDay()]);
        DB::table('activities')->where('id', $activities[4]['id'])->update(['status' => 'cancelled']);
        $this->assertCount(1, $feed());

        DB::table('activity_categories')->where('id', $first->activity_category_id)->update(['is_active' => false]);
        $this->assertSame([], $feed());
    }
}
