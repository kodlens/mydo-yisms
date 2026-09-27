<?php

namespace Database\Seeders;

use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        // Allow this seeder to run on its own, without requiring sample users.
        $this->call(ActivityCategorySeeder::class);

        $categories = DB::table('activity_categories')->pluck('id', 'slug');
        $now = CarbonImmutable::now('UTC');
        $localToday = $now->setTimezone('Asia/Manila')->startOfDay();

        $activities = [
            [
                'slug' => 'sample-youth-leadership-summit',
                'title' => 'Youth Leadership Summit',
                'category' => 'leadership',
                'summary' => 'Meet fellow young leaders and turn your ideas into community action.',
                'description' => 'Build confidence through leadership workshops, group discussions, and collaborative community project planning.',
                'venue_name' => 'Municipal Convention Hall',
                'days' => 14, 'hour' => 8, 'duration' => 8,
                'capacity' => 100, 'requires_approval' => true, 'is_featured' => true,
                'requirements' => 'Bring a valid ID, a notebook, and a pen.',
            ],
            [
                'slug' => 'sample-community-tree-planting',
                'title' => 'Small actions. Greener tomorrow.',
                'category' => 'environment',
                'summary' => 'Join fellow youth volunteers for a morning of tree planting.',
                'description' => 'Learn basic tree care and help improve shared green spaces through a guided community planting activity.',
                'venue_name' => 'Community Eco Park',
                'days' => 21, 'hour' => 6, 'duration' => 4,
                'capacity' => 50, 'requires_approval' => false, 'is_featured' => false,
                'requirements' => 'Wear closed shoes and bring water, a hat, and gardening gloves.',
            ],
            [
                'slug' => 'sample-digital-skills-workshop',
                'title' => 'Build your digital toolkit',
                'category' => 'skills-learning',
                'summary' => 'Explore practical digital tools for school, work, and creative projects.',
                'description' => 'A beginner-friendly workshop covering digital productivity, online collaboration, and responsible use of technology.',
                'venue_name' => 'Youth Development Center',
                'days' => 28, 'hour' => 9, 'duration' => 3,
                'capacity' => 30, 'requires_approval' => false, 'is_featured' => false,
                'requirements' => 'Bring a notebook and, if available, a laptop.',
            ],
            [
                'slug' => 'sample-youth-sports-day',
                'title' => 'Youth Sports Day',
                'category' => 'sports',
                'summary' => 'Get moving and make new friends through friendly team games.',
                'description' => 'Take part in recreational games and team challenges that celebrate teamwork, inclusion, and sportsmanship.',
                'venue_name' => 'Municipal Sports Complex',
                'days' => 35, 'hour' => 7, 'duration' => 10,
                'capacity' => 120, 'requires_approval' => false, 'is_featured' => false,
                'requirements' => 'Wear appropriate sports attire and bring a water bottle.',
            ],
            [
                'slug' => 'sample-community-volunteer-day',
                'title' => 'A little time. A big difference.',
                'category' => 'community',
                'summary' => 'Share your time and help build a more connected community.',
                'description' => 'Join a community service morning with fellow youth volunteers. Activities include organizing donated supplies and preparing community spaces.',
                'venue_name' => 'Youth Development Center',
                'days' => 42, 'hour' => 8, 'duration' => 4,
                'capacity' => null, 'requires_approval' => false, 'is_featured' => false,
                'requirements' => 'Wear comfortable clothing and bring drinking water.',
            ],
        ];

        DB::transaction(function () use ($activities, $categories, $now, $localToday) {
            foreach ($activities as $activity) {
                // Reruns must not reset dates, capacity, or staff edits on existing records.
                if (DB::table('activities')->where('slug', $activity['slug'])->exists()) {
                    continue;
                }

                $startsAt = $localToday->addDays($activity['days'])->setHour($activity['hour'])->utc();

                DB::table('activities')->insert([
                    'activity_category_id' => $categories[$activity['category']],
                    'created_by' => null,
                    'title' => $activity['title'],
                    'slug' => $activity['slug'],
                    'summary' => $activity['summary'],
                    'description' => 'Sample activity for demonstration purposes. '.$activity['description'],
                    'venue_name' => $activity['venue_name'],
                    'starts_at' => $startsAt,
                    'ends_at' => $startsAt->addHours($activity['duration']),
                    'registration_opens_at' => $now,
                    'registration_closes_at' => $startsAt->subDay(),
                    'capacity' => $activity['capacity'],
                    'requires_registration' => true,
                    'requires_approval' => $activity['requires_approval'],
                    'eligibility_notes' => 'For youth interested in this activity. Confirm eligibility with the youth office.',
                    'requirements' => $activity['requirements'],
                    'status' => 'published',
                    'published_at' => $now,
                    'is_featured' => $activity['is_featured'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        });
    }
}
