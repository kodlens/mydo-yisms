<?php

namespace App\Events;

use App\Models\ScholarshipApplication;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewScholarshipApplicationEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ScholarshipApplication $application;

    public function __construct(ScholarshipApplication $application)
    {
        $this->application = $application->loadMissing(['youthProfile', 'scholarshipType']);
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('staff-notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'scholarship.application.submitted';
    }

    public function broadcastWith(): array
    {
        $profile = $this->application->youthProfile;
        $applicantName = $profile
            ? trim("{$profile->fname} {$profile->lname}")
            : 'A youth';
        $scholarshipName = $this->application->scholarshipType?->name ?? 'Scholarship Program';

        return [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'application_id' => $this->application->id,
            'youth_profile_id' => $this->application->youth_profile_id,
            'applicant_name' => $applicantName,
            'scholarship_name' => $scholarshipName,
            'reference' => $this->application->reference,
            'title' => 'New Scholarship Application',
            'description' => "{$applicantName} submitted an application for {$scholarshipName}.",
            'url' => route('staff.scholarship-applicants.show', $this->application->id, false),
            'submitted_at' => ($this->application->submitted_at ?? now())->toIso8601String(),
        ];
    }
}
