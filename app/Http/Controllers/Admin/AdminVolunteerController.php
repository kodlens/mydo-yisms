<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\ManagesVolunteers;
use App\Http\Controllers\Controller;
use App\Models\Volunteer;
use App\Models\YouthProfile;
use App\Support\VolunteerPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminVolunteerController extends Controller
{
    use ManagesVolunteers;

    public function index(): Response
    {
        return Inertia::render('admin/volunteers/admin-volunteers-page');
    }

    public function getData(Request $req): JsonResponse
    {
        return response()->json(
            VolunteerPresenter::listing(
                trim((string) $req->input('search', '')),
                (string) $req->input('status', ''),
                (int) $req->input('perpage', 10),
                (int) $req->input('page', 1),
            ),
        );
    }

    /**
     * Register a volunteer who already has a youth account. The staff panel does not
     * offer this, so the action stays with administration.
     */
    public function store(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'email' => ['required', 'email', 'exists:youth_profiles,email'],
            'motivation' => ['nullable', 'string', 'max:2000'],
            'skills' => ['nullable', 'string', 'max:255'],
            'availability' => ['nullable', 'string', 'max:255'],
            'emergency_contact_name' => ['nullable', 'string', 'max:100'],
            'emergency_contact_number' => ['nullable', 'string', 'max:30'],
            'status' => ['present', Rule::in(['pending', 'active', 'inactive'])],
        ], $this->volunteerMessages());

        $profile = YouthProfile::where('email', $validated['email'])->firstOrFail();

        // A youth can only hold one volunteer record.
        if ($profile->volunteerRecord()->exists()) {
            return response()->json([
                'message' => 'That youth is already registered as a volunteer.',
                'success' => false,
                'errors' => ['email' => ['This youth is already registered as a volunteer.']],
            ], 422);
        }

        $volunteer = Volunteer::create([
            'youth_profile_id' => $profile->id,
            'status' => $validated['status'],
            'motivation' => VolunteerPresenter::blankToNull($validated['motivation'] ?? null),
            'skills' => VolunteerPresenter::blankToNull($validated['skills'] ?? null),
            'availability' => VolunteerPresenter::blankToNull($validated['availability'] ?? null),
            'emergency_contact_name' => VolunteerPresenter::blankToNull($validated['emergency_contact_name'] ?? null),
            'emergency_contact_number' => VolunteerPresenter::blankToNull($validated['emergency_contact_number'] ?? null),
            'approved_by' => $validated['status'] === 'active' ? $req->user()?->id : null,
            'approved_at' => $validated['status'] === 'active' ? now() : null,
            'registered_at' => now(),
        ]);

        return response()->json([
            'message' => 'Volunteer registered successfully.',
            'success' => true,
            'data' => $volunteer->fresh(),
        ], 201);
    }

    public function destroy($id): JsonResponse
    {
        $volunteer = Volunteer::withCount(['assignments', 'attendanceRecords'])->findOrFail($id);

        // Attendance is the service record; archive the volunteer instead of losing it.
        if ($volunteer->assignments_count > 0 || $volunteer->attendance_records_count > 0) {
            return response()->json([
                'message' => 'This volunteer has activity assignments or attendance records. Set them to inactive instead of deleting them.',
                'success' => false,
            ], 422);
        }

        $volunteer->delete();

        return response()->json([
            'message' => 'Volunteer successfully deleted.',
            'success' => true,
        ]);
    }
}
