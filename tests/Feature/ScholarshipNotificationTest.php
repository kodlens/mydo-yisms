<?php

namespace Tests\Feature;

use App\Events\NewScholarshipApplicationEvent;
use App\Events\ScholarshipApplicationStatusEvent;
use App\Models\AcademicYear;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipType;
use App\Models\User;
use App\Models\YouthProfile;
use App\Notifications\NewScholarshipApplicationNotification;
use App\Notifications\ScholarshipApplicationStatusNotification;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class ScholarshipNotificationTest extends TestCase
{
    use DatabaseTransactions;

    protected User $staff;
    protected YouthProfile $youth;
    protected AcademicYear $acadYear;
    protected ScholarshipType $scholarship;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->staff = User::create([
            'username' => 'staff_' . Str::random(6),
            'fname' => 'Elena',
            'lname' => 'Staff',
            'email' => 'staff_' . Str::random(6) . '@example.gov.ph',
            'password' => bcrypt('password'),
            'role' => 'staff',
        ]);

        $this->youth = YouthProfile::create([
            'fname' => 'Carlo',
            'lname' => 'Dalisay ' . Str::random(4),
            'email' => 'carlo_' . Str::random(6) . '@example.com',
            'password' => bcrypt('password'),
            'role' => 'youth',
            'school_name' => 'Bukidnon State University',
            'program' => 'BS Information Technology',
            'year' => 3,
            'student_id' => 'BSIT-2024-0555',
            'status' => 'approved',
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
            'scholarship' => 'Tertiary Youth Grant ' . uniqid(),
            'target_beneficiary' => 'College students',
            'benefit' => 'Tuition assistance',
            'amount' => 8000,
            'is_active' => true,
        ]);
    }

    public function test_youth_scholarship_submission_notifies_staff(): void
    {
        Event::fake([NewScholarshipApplicationEvent::class]);

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
            'previous_semester_gwa' => 1.50,
            'coe' => [['response' => ['filename' => $coeName]]],
            'cog' => [['response' => ['filename' => $cogName]]],
            'cedula' => [['response' => ['filename' => $cedulaName]]],
            'school_id' => [['response' => ['filename' => $schoolIdName]]],
        ];

        $response = $this->actingAs($this->youth, 'youth')
            ->postJson(route('youth.services.apply-scholarship.store', $this->scholarship->id), $payload);

        $response->assertOk();
        $response->assertJson(['success' => true]);

        // 1. Verify staff user has database notification
        $this->staff->refresh();
        $this->assertCount(1, $this->staff->notifications);
        $notif = $this->staff->notifications->first();
        $this->assertEquals('scholarship_application', $notif->data['type']);
        $this->assertEquals($this->youth->id, $notif->data['youth_profile_id']);

        // 2. Verify event was dispatched
        Event::assertDispatched(NewScholarshipApplicationEvent::class, function ($event) {
            return $event->application->youth_profile_id === $this->youth->id;
        });

        // 3. Staff fetches notifications API
        $staffNotifsResponse = $this->actingAs($this->staff, 'web')
            ->getJson(route('staff.notifications.index'));

        $staffNotifsResponse->assertOk();
        $staffNotifsResponse->assertJson([
            'unread_count' => 1,
        ]);
        $this->assertEquals($notif->id, $staffNotifsResponse->json('notifications.0.id'));

        // 4. Staff marks notification as read
        $this->actingAs($this->staff, 'web')
            ->postJson(route('staff.notifications.mark-as-read', $notif->id))
            ->assertOk();

        $this->staff->refresh();
        $this->assertEquals(0, $this->staff->unreadNotifications()->count());

        // 5. Staff marks all read endpoint works
        $this->actingAs($this->staff, 'web')
            ->postJson(route('staff.notifications.mark-all-read'))
            ->assertOk();
    }

    public function test_staff_approving_or_rejecting_scholarship_notifies_youth(): void
    {
        Event::fake([ScholarshipApplicationStatusEvent::class]);

        $application = ScholarshipApplication::create([
            'academic_year_id' => $this->acadYear->id,
            'youth_profile_id' => $this->youth->id,
            'scholarship_type_id' => $this->scholarship->id,
            'coe_path' => 'coe.pdf',
            'cog_path' => 'cog.pdf',
            'cedula_path' => 'cedula.jpg',
            'school_id_path' => 'school_id.png',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        // Staff updates status to approved
        $this->actingAs($this->staff, 'web')
            ->patch(route('staff.applicants.status.update', $application->id), [
                'registration_status' => 'approved',
            ])
            ->assertRedirect();

        $application->refresh();
        $this->assertEquals('approved', $application->status);

        // Youth received database notification
        $this->youth->refresh();
        $this->assertCount(1, $this->youth->notifications);
        $youthNotif = $this->youth->notifications->first();
        $this->assertEquals('scholarship_status', $youthNotif->data['type']);
        $this->assertEquals('approved', $youthNotif->data['status']);

        // Event was dispatched
        Event::assertDispatched(ScholarshipApplicationStatusEvent::class, function ($event) use ($application) {
            return $event->application->id === $application->id && $event->application->status === 'approved';
        });

        // Youth fetches notifications API
        $youthResponse = $this->actingAs($this->youth, 'youth')
            ->getJson(route('youth.notifications.index'));

        $youthResponse->assertOk();
        $youthResponse->assertJson(['unread_count' => 1]);

        // Youth marks notification as read
        $this->actingAs($this->youth, 'youth')
            ->postJson(route('youth.notifications.mark-as-read', $youthNotif->id))
            ->assertOk();

        $this->youth->refresh();
        $this->assertEquals(0, $this->youth->unreadNotifications()->count());
    }

    public function test_staff_rejecting_scholarship_includes_reason_in_notification(): void
    {
        $application = ScholarshipApplication::create([
            'academic_year_id' => $this->acadYear->id,
            'youth_profile_id' => $this->youth->id,
            'scholarship_type_id' => $this->scholarship->id,
            'coe_path' => 'coe.pdf',
            'cog_path' => 'cog.pdf',
            'cedula_path' => 'cedula.jpg',
            'school_id_path' => 'school_id.png',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        $this->actingAs($this->staff, 'web')
            ->patch(route('staff.applicants.status.update', $application->id), [
                'registration_status' => 'rejected',
                'rejection_reason' => 'GWA below required threshold for this program.',
            ])
            ->assertRedirect();

        $this->youth->refresh();
        $youthNotif = $this->youth->notifications->first();
        $this->assertNotNull($youthNotif);
        $this->assertEquals('rejected', $youthNotif->data['status']);
        $this->assertEquals('GWA below required threshold for this program.', $youthNotif->data['rejection_reason']);
        $this->assertStringContainsString('GWA below required threshold', $youthNotif->data['message']);
    }
}
