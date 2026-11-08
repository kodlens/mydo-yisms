<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipType;
use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Str;
use Tests\TestCase;

class StaffScholarshipTest extends TestCase
{
    use DatabaseTransactions;

    protected User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $this->staff = User::create([
            'username' => 'staff_' . Str::random(6),
            'fname' => 'Staff',
            'lname' => 'Officer',
            'email' => 'staff_' . Str::random(6) . '@example.gov.ph',
            'password' => bcrypt('password'),
            'role' => 'staff',
        ]);
    }

    public function test_staff_can_view_scholarships_index_page(): void
    {
        $response = $this->actingAs($this->staff)->get(route('staff.scholarships.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('staff/scholarships/staff-scholarships-page'));
    }

    public function test_staff_can_fetch_paginated_scholarships_data(): void
    {
        ScholarshipType::create([
            'scholarship' => 'Tertiary Assistance Grant ' . uniqid(),
            'target_beneficiary' => 'College youth',
            'benefit' => 'Tuition stipend',
            'amount' => 5000,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->staff)->getJson(route('staff.scholarships.get-data'));

        $response->assertOk();
        $response->assertJsonStructure([
            'data',
            'total',
            'current_page',
            'per_page',
        ]);
    }

    public function test_staff_can_create_new_scholarship_program(): void
    {
        $name = 'Municipal Academic Excellence ' . uniqid();

        $payload = [
            'scholarship' => $name,
            'target_beneficiary' => 'Honor graduates with GWA above 1.75',
            'benefit' => 'Php 8,000 per semester',
            'amount' => 8000.00,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->staff)->postJson(route('staff.scholarships.store'), $payload);

        $response->assertStatus(201);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('scholarship_types', [
            'scholarship' => $name,
            'amount' => 8000.00,
            'is_active' => 1,
        ]);
    }

    public function test_duplicate_scholarship_program_is_rejected(): void
    {
        $name = 'Duplicate Check ' . uniqid();

        ScholarshipType::create([
            'scholarship' => $name,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->staff)->postJson(route('staff.scholarships.store'), [
            'scholarship' => $name,
            'is_active' => true,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['scholarship']);
    }

    public function test_staff_can_update_scholarship_program(): void
    {
        $scholarship = ScholarshipType::create([
            'scholarship' => 'Old Title ' . uniqid(),
            'amount' => 3000,
            'is_active' => false,
        ]);

        $updatedTitle = 'Updated Title ' . uniqid();

        $response = $this->actingAs($this->staff)->putJson(route('staff.scholarships.update', $scholarship->id), [
            'scholarship' => $updatedTitle,
            'target_beneficiary' => 'Updated target',
            'benefit' => 'Updated benefit',
            'amount' => 6000,
            'is_active' => true,
        ]);

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('scholarship_types', [
            'id' => $scholarship->id,
            'scholarship' => $updatedTitle,
            'amount' => 6000,
            'is_active' => 1,
        ]);
    }

    public function test_staff_can_toggle_scholarship_active_status(): void
    {
        $scholarship = ScholarshipType::create([
            'scholarship' => 'Toggle Status ' . uniqid(),
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->staff)->postJson(
            route('staff.scholarships.toggle-status', $scholarship->id),
            ['is_active' => true]
        );

        $response->assertOk();
        $response->assertJson(['success' => true, 'is_active' => true]);

        $this->assertTrue($scholarship->fresh()->is_active);
    }

    public function test_staff_can_delete_scholarship_without_applications(): void
    {
        $scholarship = ScholarshipType::create([
            'scholarship' => 'To Be Deleted ' . uniqid(),
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->staff)->deleteJson(
            route('staff.scholarships.destroy', $scholarship->id)
        );

        $response->assertOk();
        $response->assertJson(['success' => true]);

        $this->assertDatabaseMissing('scholarship_types', [
            'id' => $scholarship->id,
        ]);
    }

    public function test_staff_cannot_delete_scholarship_with_existing_applications(): void
    {
        $scholarship = ScholarshipType::create([
            'scholarship' => 'With Application ' . uniqid(),
            'is_active' => true,
        ]);

        $acadYear = AcademicYear::firstOrCreate(
            ['code' => '2026-2027-1'],
            ['name' => 'AY 2026-2027 1st Semester', 'is_active' => true]
        );

        $youth = YouthProfile::create([
            'fname' => 'Juan',
            'lname' => 'Dela Cruz ' . Str::random(4),
            'email' => 'youth_' . Str::random(6) . '@example.com',
            'password' => bcrypt('password'),
            'is_active' => true,
            'school_name' => 'State University',
            'program' => 'BS IT',
            'year' => 2,
            'is_graduated' => false,
        ]);

        ScholarshipApplication::create([
            'academic_year_id' => $acadYear->id,
            'youth_profile_id' => $youth->id,
            'scholarship_type_id' => $scholarship->id,
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($this->staff)->deleteJson(
            route('staff.scholarships.destroy', $scholarship->id)
        );

        $response->assertStatus(422);
        $response->assertJson(['success' => false]);

        $this->assertDatabaseHas('scholarship_types', [
            'id' => $scholarship->id,
        ]);
    }

    public function test_unauthorized_users_cannot_access_staff_scholarships(): void
    {
        $response = $this->get(route('staff.scholarships.index'));
        $response->assertRedirect();

        $youth = YouthProfile::create([
            'fname' => 'Youth',
            'lname' => 'User ' . Str::random(4),
            'email' => 'youth_unauth_' . Str::random(6) . '@example.com',
            'password' => bcrypt('password'),
            'is_active' => true,
        ]);

        $responseYouth = $this->actingAs($youth, 'youth')->get(route('staff.scholarships.index'));
        $responseYouth->assertRedirect();
    }
}
