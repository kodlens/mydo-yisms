<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipType;
use App\Models\YouthProfile;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class YouthApplyScholarshipTest extends TestCase
{
    use DatabaseTransactions;

    protected YouthProfile $youth;
    protected AcademicYear $acadYear;
    protected ScholarshipType $scholarship;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->youth = YouthProfile::create([
            'fname' => 'Maria',
            'lname' => 'Santos ' . Str::random(4),
            'email' => 'maria_' . Str::random(6) . '@example.com',
            'password' => bcrypt('password'),
            'school_name' => 'Bukidnon State University',
            'program' => 'BS Information Technology',
            'year' => 2,
            'student_id' => 'BSIT-2024-0099',
            'is_active' => true,
            'is_graduated' => false,
        ]);

        $this->acadYear = AcademicYear::where('is_active', 1)->first()
            ?? AcademicYear::create([
                'code' => '2026-2027-1',
                'name' => 'AY 2026-2027 1st Semester',
                'is_active' => true,
            ]);

        $this->scholarship = ScholarshipType::create([
            'scholarship' => 'Municipal Youth Assistance ' . uniqid(),
            'target_beneficiary' => 'College students',
            'benefit' => 'Tuition grant',
            'amount' => 5000,
            'is_active' => true,
        ]);
    }

    public function test_youth_can_view_scholarship_application_page(): void
    {
        $response = $this->actingAs($this->youth, 'youth')
            ->get(route('youth.services.apply-scholarship.index', $this->scholarship->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('youth/services/scholarships/youth-apply-scholarship-page')
            ->has('scholarshipType')
            ->has('academicYear')
        );
    }

    public function test_youth_can_upload_files_to_temp_endpoint(): void
    {
        $file = UploadedFile::fake()->create('sample_coe.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->youth, 'youth')
            ->postJson(route('open.temp-upload'), [
                'upload' => $file,
            ]);

        $response->assertOk();
        $response->assertJsonStructure(['status', 'filename', 'path']);
        $this->assertEquals('success', $response->json('status'));

        $filename = $response->json('filename');
        Storage::disk('public')->assertExists('temp/' . $filename);
    }

    public function test_youth_can_submit_scholarship_application_successfully(): void
    {
        // Upload 4 fake documents to temp storage
        $coe = UploadedFile::fake()->create('coe.pdf', 200, 'application/pdf');
        $cog = UploadedFile::fake()->create('cog.pdf', 200, 'application/pdf');
        $cedula = UploadedFile::fake()->create('cedula.jpg', 200, 'image/jpeg');
        $schoolId = UploadedFile::fake()->create('school_id.png', 200, 'image/png');

        $coeName = basename($coe->store('temp', 'public'));
        $cogName = basename($cog->store('temp', 'public'));
        $cedulaName = basename($cedula->store('temp', 'public'));
        $schoolIdName = basename($schoolId->store('temp', 'public'));

        $payload = [
            'scholarship_type_id' => $this->scholarship->id,
            'previous_semester_gwa' => 1.75,
            'coe' => [
                ['response' => ['filename' => $coeName]],
            ],
            'cog' => [
                ['response' => ['filename' => $cogName]],
            ],
            'cedula' => [
                ['response' => ['filename' => $cedulaName]],
            ],
            'school_id' => [
                ['response' => ['filename' => $schoolIdName]],
            ],
        ];

        $response = $this->actingAs($this->youth, 'youth')
            ->postJson(route('youth.services.apply-scholarship.store', $this->scholarship->id), $payload);

        $response->assertOk();
        $response->assertJson(['success' => true]);
        $this->assertNotNull($response->json('reference'));
        $this->assertStringStartsWith('SCH-', $response->json('reference'));

        $this->assertDatabaseHas('scholarship_applications', [
            'youth_profile_id' => $this->youth->id,
            'scholarship_type_id' => $this->scholarship->id,
            'academic_year_id' => $this->acadYear->id,
            'status' => 'pending',
            'reference' => $response->json('reference'),
        ]);

        $this->assertEquals(1.75, (float) $this->youth->fresh()->previous_semester_gwa);
    }

    public function test_duplicate_application_in_same_academic_year_is_blocked(): void
    {
        // Create an existing application
        ScholarshipApplication::create([
            'academic_year_id' => $this->acadYear->id,
            'youth_profile_id' => $this->youth->id,
            'scholarship_type_id' => $this->scholarship->id,
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        $payload = [
            'scholarship_type_id' => $this->scholarship->id,
            'previous_semester_gwa' => 1.75,
            'coe' => [['response' => ['filename' => 'coe.pdf']]],
            'cog' => [['response' => ['filename' => 'cog.pdf']]],
            'cedula' => [['response' => ['filename' => 'cedula.jpg']]],
            'school_id' => [['response' => ['filename' => 'school_id.png']]],
        ];

        $response = $this->actingAs($this->youth, 'youth')
            ->postJson(route('youth.services.apply-scholarship.store', $this->scholarship->id), $payload);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'You have already submitted an application for this scholarship program in the current academic year.',
        ]);
    }

    public function test_application_fails_if_previous_semester_gwa_is_missing(): void
    {
        $payload = [
            'scholarship_type_id' => $this->scholarship->id,
            // 'previous_semester_gwa' missing
            'coe' => [['response' => ['filename' => 'coe.pdf']]],
            'cog' => [['response' => ['filename' => 'cog.pdf']]],
            'cedula' => [['response' => ['filename' => 'cedula.jpg']]],
            'school_id' => [['response' => ['filename' => 'school_id.png']]],
        ];

        $response = $this->actingAs($this->youth, 'youth')
            ->postJson(route('youth.services.apply-scholarship.store', $this->scholarship->id), $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['previous_semester_gwa']);
    }

    public function test_application_fails_if_documents_are_missing(): void
    {
        $payload = [
            'scholarship_type_id' => $this->scholarship->id,
            'previous_semester_gwa' => 1.75,
            'coe' => [], // Empty
            'cog' => [['response' => ['filename' => 'cog.pdf']]],
            'cedula' => [['response' => ['filename' => 'cedula.jpg']]],
            'school_id' => [['response' => ['filename' => 'school_id.png']]],
        ];

        $response = $this->actingAs($this->youth, 'youth')
            ->postJson(route('youth.services.apply-scholarship.store', $this->scholarship->id), $payload);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['coe']);
    }
}
