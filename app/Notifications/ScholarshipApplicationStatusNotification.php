<?php

namespace App\Notifications;

use App\Models\ScholarshipApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ScholarshipApplicationStatusNotification extends Notification
{
    use Queueable;

    public ScholarshipApplication $application;

    public function __construct(ScholarshipApplication $application)
    {
        $this->application = $application->loadMissing(['scholarshipType']);
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $scholarshipName = $this->application->scholarshipType?->name ?? 'Scholarship Program';
        $status = $this->application->status;
        $reason = $this->application->rejection_reason;

        $isApproved = $status === 'approved';
        $title = $isApproved ? 'Scholarship Application Approved!' : 'Scholarship Application Update';
        $message = $isApproved
            ? "Congratulations! Your application for {$scholarshipName} has been approved."
            : "Your application for {$scholarshipName} was not approved." . ($reason ? " Reason: {$reason}" : '');

        return [
            'type' => 'scholarship_status',
            'application_id' => $this->application->id,
            'scholarship_type_id' => $this->application->scholarship_type_id,
            'scholarship_name' => $scholarshipName,
            'status' => $status,
            'rejection_reason' => $reason,
            'title' => $title,
            'message' => $message,
            'url' => route('youth.services.apply-scholarship.index', $this->application->scholarship_type_id, false),
            'updated_at' => now()->toIso8601String(),
        ];
    }
}
