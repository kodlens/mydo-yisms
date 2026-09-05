<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class YouthServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('youth/services/youth-service-page', [
            'services' => $this->services(),
        ]);
    }

    public function show(string $service): Response
    {
        abort_unless(array_key_exists($service, $this->services()), 404);

        return Inertia::render('youth/services/youth-show-page', [
            'service' => $this->services()[$service],
        ]);
    }

    private function services(): array
    {
        return [
            'scholarship' => [
                'key' => 'scholarship',
                'title' => 'Scholarship Assistance',
                'description' => 'Apply for education support and submit school requirements for MYDO review.',
                'status' => 'Open',
                'requirements' => ['Certificate of Enrolment', 'Certificate of Grades', 'Cedula', 'School ID'],
            ],
            'cash-incentive' => [
                'key' => 'cash-incentive',
                'title' => 'Cash Incentive',
                'description' => 'Request cash incentive assistance when a qualified program is available.',
                'status' => 'Open',
                'requirements' => ['Valid ID', 'Proof of eligibility', 'Contact information'],
            ],
            'activities' => [
                'key' => 'activities',
                'title' => 'Youth Activities',
                'description' => 'Join seminars, trainings, volunteer drives, and MYDO community programs.',
                'status' => 'Open',
                'requirements' => ['Updated youth profile', 'Guardian consent when required'],
            ],
            'documents' => [
                'key' => 'documents',
                'title' => 'Document Requests',
                'description' => 'Request certificates or documents related to MYDO participation records.',
                'status' => 'Coming soon',
                'requirements' => ['Updated youth profile'],
            ],
        ];
    }
}
