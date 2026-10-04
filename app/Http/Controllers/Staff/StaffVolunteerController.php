<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Concerns\ManagesVolunteers;
use App\Http\Controllers\Controller;
use App\Support\VolunteerPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Staff work the volunteer programme day to day: reviewing applications, assigning
 * volunteers to activities, and recording attendance. Registering a volunteer or
 * deleting the record stays with administration.
 */
class StaffVolunteerController extends Controller
{
    use ManagesVolunteers;

    public function index(): Response
    {
        return Inertia::render('staff/volunteers/staff-volunteers-page');
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
}
