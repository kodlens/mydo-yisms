<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StaffApplicantController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('staff/staff-applicant-index');
    }

    public function show(ScholarshipApplication $applicant): Response
    {
        $applicant->load(['youthProfile.youth', 'youthProfile.province', 'youthProfile.city', 'youthProfile.barangay', 'documents']);

        return Inertia::render('staff/staff-applicant-show', [
            'applicant' => $this->applicantPayload($applicant),
            'documents' => $this->documentsFor($applicant),
        ]);
    }

    public function getData(Request $request)
    {
        $perPage = (int) $request->input('perpage', 10);
        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status');

        return ScholarshipApplication::query()
            ->with(['youthProfile.youth', 'youthProfile.province', 'youthProfile.city', 'youthProfile.barangay'])
            ->when(in_array($status, ['pending', 'approved', 'rejected', 'draft'], true), function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas('youthProfile', function ($query) use ($search) {
                    $query->where('lname', 'like', $search . '%')
                        ->orWhere('fname', 'like', $search . '%')
                        ->orWhere('school_name', 'like', '%' . $search . '%')
                        ->orWhere('program', 'like', '%' . $search . '%')
                        ->orWhereHas('youth', function ($query) use ($search) {
                            $query->where('email', 'like', '%' . $search . '%');
                        });
                });
            })
            ->latest()
            ->paginate($perPage)
            ->through(function (ScholarshipApplication $application) {
                return $this->applicantPayload($application);
            });
    }

    public function updateStatus(Request $request, ScholarshipApplication $applicant)
    {
        $validated = $request->validate([
            'registration_status' => ['required', 'string', 'in:pending,approved,rejected'],
            'rejection_reason' => ['required_if:registration_status,rejected', 'nullable', 'string', 'max:2000'],
        ]);

        $applicant->forceFill([
            'status' => $validated['registration_status'],
            'rejection_reason' => $validated['registration_status'] === 'rejected'
                ? $validated['rejection_reason']
                : null,
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
        ])->save();

        $applicant->loadMissing('youthProfile.youth');
        $applicant->youthProfile?->youth?->forceFill([
            'registration_status' => $validated['registration_status'],
            'rejection_reason' => $validated['registration_status'] === 'rejected'
                ? $validated['rejection_reason']
                : null,
        ])->save();

        return back()->with('status', 'Applicant status updated.');
    }

    private function applicantPayload(ScholarshipApplication $application): array
    {
        $profile = $application->youthProfile;
        $youth = $profile?->youth;

        return [
            'id' => $application->id,
            'youth_id' => $youth?->id,
            'youth_profile_id' => $profile?->id,
            'lname' => $profile?->lname,
            'fname' => $profile?->fname,
            'mname' => $profile?->mname,
            'suffix' => $profile?->suffix,
            'birth_date' => $profile?->birth_date,
            'sex' => $profile?->sex,
            'civil_status' => $profile?->civil_status,
            'mobile_number' => $profile?->mobile_number,
            'email' => $youth?->email,
            'provCode' => $profile?->provCode,
            'citymunCode' => $profile?->citymunCode,
            'brgyCode' => $profile?->brgyCode,
            'street_address' => $profile?->street_address,
            'zip_code' => $profile?->zip_code,
            'school_name' => $profile?->school_name,
            'program' => $profile?->program,
            'year' => $profile?->year,
            'previous_semester_gwa' => $profile?->previous_semester_gwa,
            'guardian_name' => $profile?->guardian_name,
            'guardian_contact_number' => $profile?->guardian_contact_number,
            'monthly_family_income' => $profile?->monthly_family_income,
            'registration_status' => $application->status,
            'rejection_reason' => $application->rejection_reason,
            'submitted_at' => $application->submitted_at,
            'reviewed_at' => $application->reviewed_at,
            'province' => $profile?->province,
            'city' => $profile?->city,
            'barangay' => $profile?->barangay,
        ];
    }

    private function documentsFor(ScholarshipApplication $application): array
    {
        $labels = [
            'coe' => 'Certificate of Enrolment',
            'cog' => 'Certificate of Grade',
            'cedula' => 'Cedula',
            'school_id' => 'School ID',
            'psa' => 'PSA',
        ];

        return $application->documents
            ->map(function ($document) use ($labels) {
                $path = $document->path;

                return [
                    'key' => $document->type,
                    'label' => $labels[$document->type] ?? strtoupper((string) $document->type),
                    'path' => $path,
                    'url' => $path ? Storage::disk('public')->url($path) : null,
                    'exists' => $path ? Storage::disk('public')->exists($path) : false,
                ];
            })
            ->values()
            ->all();
    }
}
