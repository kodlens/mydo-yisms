<?php

namespace App\Events;

use App\Models\ScholarshipApplication;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScholarshipApplicationStatusEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ScholarshipApplication $application;

    public function __construct(ScholarshipApplication $application)
    {
        $this->application = $application->loadMissing(['scholarshipType']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('youth-notifications.' . $this->application->youth_profile_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'scholarship.status.updated';
    }

    public function broadcastWith(): array
    {
        $scholarshipName = $this->application->scholarshipType?->name ?? 'Scholarship Program';
        $status = $this->application->status;
        $reason = $this->application->rejection_reason;

        $isApproved = $status === 'approved';
        $title = $isApproved ? 'Scholarship Application Approved!' : 'Scholarship Application Update';
        $description = $isApproved
            ? "Congratulations! Your application for {$scholarshipName} has been approved."
            : "Your application for {$scholarshipName} was not approved." . ($reason ? " Reason: {$reason}" : '');

        return [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'application_id' => $this->application->id,
            'scholarship_type_id' => $this->application->scholarship_type_id,
            'scholarship_name' => $scholarshipName,
            'status' => $status,
            'rejection_reason' => $reason,
            'title' => $title,
            'description' => $description,
            'url' => route('youth.services.apply-scholarship.index', $this->application->scholarship_type_id, false),
            'updated_at' => now()->toIso8601String(),
        ];
    }
}
