<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipType;
use App\Support\FileMover;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class YouthApplyScholarshipController extends Controller
{
    /**
     * Show the scholarship application form or current application status.
     */
    public function index(int $id): Response
    {
        $user = Auth::guard('youth')->user();
        if ($user) {
            $user->load(['province', 'city', 'barangay']);
        }

        $scholarshipType = ScholarshipType::findOrFail($id);

        $acadYear = AcademicYear::where('is_active', 1)->first();

        $scholarshipApplication = null;
        if ($user && $acadYear) {
            $scholarshipApplication = ScholarshipApplication::where('youth_profile_id', $user->id)
                ->where('scholarship_type_id', $scholarshipType->id)
                ->where('academic_year_id', $acadYear->id)
                ->with(['academicYear', 'scholarshipType'])
                ->latest()
                ->first();
        }

        return Inertia::render('youth/services/scholarships/youth-apply-scholarship-page', [
            'xToken' => csrf_token(),
            'scholarshipType' => $scholarshipType,
            'scholarshipApplication' => $scholarshipApplication,
            'academicYear' => $acadYear,
            'youth' => $user,
        ]);
    }

    /**
     * Store a submitted scholarship application with uploaded documents.
     */
    public function store(Request $req, int $scholarship): JsonResponse
    {
        $user = Auth::guard('youth')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $validated = $req->validate([
            'scholarship_type_id' => ['required', 'integer', 'exists:scholarship_types,id'],
            'previous_semester_gwa' => ['required', 'numeric', 'between:1,100'],
            'coe' => ['required', 'array', 'min:1'],
            'cog' => ['required', 'array', 'min:1'],
            'cedula' => ['required', 'array', 'min:1'],
            'school_id' => ['required', 'array', 'min:1'],
        ], [
            'scholarship_type_id.required' => 'Scholarship program is required.',
            'scholarship_type_id.exists' => 'The selected scholarship program does not exist.',
            'previous_semester_gwa.required' => 'Your Previous Semester GWA is required.',
            'previous_semester_gwa.numeric' => 'GWA must be a valid number (e.g. 1.75 or 88.50).',
            'previous_semester_gwa.between' => 'GWA must be between 1.00 and 100.00.',
            'coe.required' => 'Certificate of Enrollment (COE) is required.',
            'cog.required' => 'Certificate of Grades (COG) is required.',
            'cedula.required' => 'Photocopy of Community Tax Certificate (Cedula) is required.',
            'school_id.required' => 'Photocopy of School ID is required.',
        ]);

        $acadYear = AcademicYear::where('is_active', 1)->first();
        if (!$acadYear) {
            return response()->json([
                'success' => false,
                'message' => 'Applications are temporarily closed because no active academic year is configured.',
            ], 422);
        }

        // Check if the youth already has an application for this scholarship in the active academic year
        $existing = ScholarshipApplication::where('youth_profile_id', $user->id)
            ->where('scholarship_type_id', $validated['scholarship_type_id'])
            ->where('academic_year_id', $acadYear->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'You have already submitted an application for this scholarship program in the current academic year.',
            ], 422);
        }

        $files = [
            'coe' => $validated['coe'][0]['response']['filename'] ?? null,
            'cog' => $validated['cog'][0]['response']['filename'] ?? null,
            'cedula' => $validated['cedula'][0]['response']['filename'] ?? null,
            'school_id' => $validated['school_id'][0]['response']['filename'] ?? null,
        ];

        // Ensure all uploaded files have valid filenames
        foreach ($files as $docKey => $filename) {
            if (empty($filename)) {
                $docLabels = [
                    'coe' => 'Certificate of Enrollment',
                    'cog' => 'Certificate of Grades',
                    'cedula' => 'Cedula',
                    'school_id' => 'School ID',
                ];
                $name = $docLabels[$docKey] ?? $docKey;
                return response()->json([
                    'success' => false,
                    'message' => "The uploaded file for {$name} was not properly uploaded. Please re-upload.",
                ], 422);
            }
        }

        $fileMover = new FileMover($user, $acadYear);
        $movedFiles = $fileMover->moveFromTemp($files);

        // Verify that every required document was moved
        foreach (['coe', 'cog', 'cedula', 'school_id'] as $docKey) {
            if (empty($movedFiles[$docKey]['path'])) {
                $docLabels = [
                    'coe' => 'Certificate of Enrollment',
                    'cog' => 'Certificate of Grades',
                    'cedula' => 'Cedula',
                    'school_id' => 'School ID',
                ];
                $name = $docLabels[$docKey] ?? $docKey;
                return response()->json([
                    'success' => false,
                    'message' => "Failed to process the uploaded {$name}. Please re-upload the document and submit again.",
                ], 422);
            }
        }

        // Update the youth's profile with their latest reported GWA
        $user->update([
            'previous_semester_gwa' => $validated['previous_semester_gwa'],
        ]);

        $application = ScholarshipApplication::create([
            'academic_year_id' => $acadYear->id,
            'youth_profile_id' => $user->id,
            'scholarship_type_id' => $validated['scholarship_type_id'],
            'coe_path' => $movedFiles['coe']['path'],
            'cog_path' => $movedFiles['cog']['path'],
            'cedula_path' => $movedFiles['cedula']['path'],
            'school_id_path' => $movedFiles['school_id']['path'],
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Scholarship application successfully submitted.',
            'reference' => $application->reference,
        ], 200);
    }
}
