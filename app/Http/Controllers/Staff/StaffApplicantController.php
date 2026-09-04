<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Student;

class StaffApplicantController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('staff/staff-applicant-index');
    }

    public function show(Student $applicant): Response
    {
        $applicant->load(['province', 'city', 'barangay']);

        return Inertia::render('staff/staff-applicant-show', [
            'applicant' => $applicant,
            'documents' => $this->documentsFor($applicant),
        ]);
    }

    public function getData(Request $request)
    {
        $perPage = (int) $request->input('perpage', 10);
        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status');

        return Student::query()
        ->when(in_array($status, ['pending', 'approved', 'rejected', 'draft'], true), function ($query) use ($status) {
            $query->where('registration_status', $status);
        })
        ->when($search !== '', function ($query) use ($search) {
            $query->where(function ($query) use ($search) {
                $query->where('lname', 'like', $search . '%')
                    ->orWhere('fname', 'like', $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('school_name', 'like', '%' . $search . '%')
                    ->orWhere('program', 'like', '%' . $search . '%');
            });
        })
        ->orderBy('id', 'desc')
        ->paginate($perPage);
    }

    public function updateStatus(Request $request, Student $applicant)
    {
        $validated = $request->validate([
            'registration_status' => ['required', 'string', 'in:pending,approved,rejected'],
        ]);

        $applicant->forceFill([
            'registration_status' => $validated['registration_status'],
        ])->save();

        return back()->with('status', 'Applicant status updated.');
    }

    private function documentsFor(Student $student): array
    {
        $documents = [
            'coe_path' => 'Certificate of Enrolment',
            'cog_path' => 'Certificate of Grade',
            'cedula_path' => 'Cedula',
            'school_id_path' => 'School ID',
            'psa_path' => 'PSA',
        ];

        return collect($documents)
            ->map(function (string $label, string $column) use ($student) {
                $path = $student->{$column};

                return [
                    'key' => $column,
                    'label' => $label,
                    'path' => $path,
                    'url' => $path ? Storage::disk('public')->url($path) : null,
                    'exists' => $path ? Storage::disk('public')->exists($path) : false,
                ];
            })
            ->values()
            ->all();
    }
}
