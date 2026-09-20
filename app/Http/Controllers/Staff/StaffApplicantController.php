<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
        $applicant->load(['youthProfile', 'youthProfile.province', 'youthProfile.city', 'youthProfile.barangay']);

        return Inertia::render('staff/staff-applicant-show', [
            'applicant' => $this->applicantPayload($applicant)
        ]);
    }

    public function getData(Request $request)
    {
        $perPage = (int) $request->input('perpage', 10);
        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status');

        return ScholarshipApplication::query()
            ->with(['youthProfile', 'youthProfile.province', 'youthProfile.city', 'youthProfile.barangay'])
            ->when(in_array($status, ['pending', 'approved', 'rejected', 'draft'], true), function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas('youthProfile', function ($query) use ($search) {
                    $query->where('lname', 'like', $search . '%')
                        ->orWhere('fname', 'like', $search . '%')
                        ->orWhere('school_name', 'like', '%' . $search . '%')
                        ->orWhere('program', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
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

        return back()->with('status', 'Applicant status updated.');
    }

    private function applicantPayload(ScholarshipApplication $application): array
    {
        $profile = $application->youthProfile;

        return [
            'id' => $application->id,
            'youth_profile_id' => $profile?->id,
            'lname' => $profile?->lname,
            'fname' => $profile?->fname,
            'mname' => $profile?->mname,
            'suffix' => $profile?->suffix,
            'birth_date' => $profile?->birth_date,
            'sex' => $profile?->sex,
            'civil_status' => $profile?->civil_status,
            'mobile_number' => $profile?->mobile_number,
            'email' => $profile?->email,
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
            'coe_path' => $this->documentUrl($application, $application->coe_path, 'coe'),
            'cog_path' => $this->documentUrl($application, $application->cog_path, 'cog'),
            'cedula_path' => $this->documentUrl($application, $application->cedula_path, 'cedula'),
            'school_id_path' => $this->documentUrl($application, $application->school_id_path, 'school_id'),
        ];
    }

    private function documentUrl(ScholarshipApplication $application, ?string $path, string $type): ?string
    {
        if (!$path) {
            return null;
        }

        $disk = Storage::disk('public');

        // New applications already store the complete public-disk path.
        if (str_starts_with($path, 'upfiles/')) {
            return $disk->url($path);
        }

        $profile = $application->youthProfile;
        $name = strtoupper(Str::slug(mb_substr($profile?->fname ?? 'X', 0, 1) . ($profile?->lname ?? 'X'), ''));
        $directory = "upfiles/{$application->youth_profile_id}_{$name}";
        $filename = basename($path);
        $documentPath = "{$directory}/{$filename}";

        // Older uploads stored the original filename before FileMover added its type prefix.
        if (!$disk->exists($documentPath) && $disk->exists("{$directory}/{$type}_{$filename}")) {
            $documentPath = "{$directory}/{$type}_{$filename}";
        }

        return $disk->url($documentPath);
    }
}
