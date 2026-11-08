<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminActivityLogsTest extends TestCase
{
    use DatabaseTransactions;

    protected function createAdminUser(): User
    {
        return User::create([
            'username' => 'admin_' . Str::random(6),
            'fname' => 'Admin',
            'lname' => 'Super',
            'email' => 'admin_' . Str::random(6) . '@example.gov.ph',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);
    }

    public function test_guests_and_non_admins_cannot_access_activity_logs(): void
    {
        $this->get('/admin/activity-logs')->assertRedirect();
        $this->getJson('/admin/get-activity-logs')->assertUnauthorized();

        $staffUser = User::create([
            'username' => 'staff_' . Str::random(6),
            'fname' => 'Staff',
            'lname' => 'Officer',
            'email' => 'staff_' . Str::random(6) . '@example.gov.ph',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'is_active' => true,
        ]);

        $this->actingAs($staffUser, 'web')->get('/admin/activity-logs')->assertRedirect('/staff/dashboard');
    }

    public function test_admin_can_view_activity_logs_page(): void
    {
        $admin = $this->createAdminUser();

        ActivityLog::create([
            'user_id' => $admin->id,
            'actor_name' => 'Admin Super',
            'actor_role' => 'admin',
            'action' => 'program_create',
            'description' => 'Created cash incentive program CIP-2026-TEST',
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->actingAs($admin, 'web')->get('/admin/activity-logs');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/activity-logs/admin-activity-logs-page')
            ->has('stats')
            ->where('stats.total_logs', 1)
            ->where('stats.logs_today', 1)
            ->has('availableRoles')
            ->has('availableActions')
        );
    }

    public function test_admin_can_query_and_filter_activity_logs(): void
    {
        $admin = $this->createAdminUser();

        ActivityLog::create([
            'user_id' => $admin->id,
            'actor_name' => 'Admin Super',
            'actor_role' => 'admin',
            'action' => 'program_create',
            'description' => 'Created cash incentive program CIP-2026-TEST',
            'ip_address' => '127.0.0.1',
        ]);

        ActivityLog::create([
            'user_id' => $admin->id,
            'actor_name' => 'Staff Officer',
            'actor_role' => 'staff',
            'action' => 'cash_release',
            'description' => 'Released cash aid to beneficiary',
            'ip_address' => '192.168.1.100',
        ]);

        $response = $this->actingAs($admin, 'web')->getJson('/admin/get-activity-logs?role=admin');
        $response->assertOk();
        $this->assertEquals(1, $response->json('total'));
        $this->assertEquals('program_create', $response->json('data.0.action'));

        // Search test
        $searchResponse = $this->actingAs($admin, 'web')->getJson('/admin/get-activity-logs?search=beneficiary');
        $searchResponse->assertOk();
        $this->assertEquals(1, $searchResponse->json('total'));
        $this->assertEquals('cash_release', $searchResponse->json('data.0.action'));
    }

    public function test_admin_can_view_single_log_detail(): void
    {
        $admin = $this->createAdminUser();

        $log = ActivityLog::create([
            'user_id' => $admin->id,
            'actor_name' => 'Admin Super',
            'actor_role' => 'admin',
            'action' => 'password_change',
            'description' => 'Changed password for user #5',
            'old_values' => ['status' => 'old'],
            'new_values' => ['status' => 'new'],
            'metadata' => ['browser' => 'Chrome'],
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->actingAs($admin, 'web')->getJson("/admin/activity-logs/{$log->id}");
        $response->assertOk();
        $response->assertJsonFragment([
            'id' => $log->id,
            'action' => 'password_change',
            'actor_name' => 'Admin Super',
        ]);
        $this->assertEquals(['status' => 'old'], $response->json('old_values'));
    }

    public function test_admin_changing_password_records_in_activity_log(): void
    {
        $admin = $this->createAdminUser();

        $youth = YouthProfile::create([
            'student_id' => 'STU-LOG-01',
            'email' => 'youthlog@example.com',
            'password' => bcrypt('password'),
            'fname' => 'Juan',
            'lname' => 'Luna',
            'sex' => 'Male',
            'school_name' => 'City College',
            'program' => 'BS IT',
            'year' => 2,
            'is_active' => true,
        ]);

        $this->actingAs($admin, 'web')->postJson("/admin/youth-profiles/{$youth->id}/change-password", [
            'password' => 'new_secret_password',
            'password_confirmation' => 'new_secret_password',
        ])->assertOk();

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'password_change',
            'actor_role' => 'admin',
            'subject_id' => $youth->id,
        ]);
    }
}
