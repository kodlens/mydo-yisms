<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActivityCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Leadership', 'slug' => 'leadership', 'description' => 'Youth leadership, civic engagement, and personal development.'],
            ['name' => 'Environment', 'slug' => 'environment', 'description' => 'Environmental awareness and community conservation activities.'],
            ['name' => 'Skills & learning', 'slug' => 'skills-learning', 'description' => 'Workshops and opportunities to develop practical skills.'],
            ['name' => 'Sports', 'slug' => 'sports', 'description' => 'Sports, recreation, and activities promoting an active lifestyle.'],
            ['name' => 'Community', 'slug' => 'community', 'description' => 'Volunteering and community service opportunities.'],
        ];

        foreach ($categories as $category) {
            // Preserve existing categories and any changes made by staff.
            if (DB::table('activity_categories')->where('slug', $category['slug'])->exists()) {
                continue;
            }

            DB::table('activity_categories')->insert([
                ...$category,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
