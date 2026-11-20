<?php

namespace App\Notifications;

use App\Models\ScholarshipApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewScholarshipApplicationNotification extends Notification
{
    use Queueable;

    public ScholarshipApplication $application;

    public function __construct(ScholarshipApplication $application)
    {
        $this->application = $application->loadMissing(['youthProfile', 'scholarshipType']);
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $profile = $this->application->youthProfile;
        $applicantName = $profile
            ? trim("{$profile->fname} {$profile->lname}")
            : 'A youth';
        $scholarshipName = $this->application->scholarshipType?->name ?? 'Scholarship Program';

        return [
            'type' => 'scholarship_application',
            'application_id' => $this->application->id,
            'youth_profile_id' => $this->application->youth_profile_id,
            'applicant_name' => $applicantName,
            'scholarship_name' => $scholarshipName,
            'reference' => $this->application->reference,
            'title' => 'New Scholarship Application',
            'message' => "{$applicantName} applied for {$scholarshipName}.",
            'url' => route('staff.scholarship-applicants.show', $this->application->id, false),
            'submitted_at' => ($this->application->submitted_at ?? now())->toIso8601String(),
        ];
    }
}
