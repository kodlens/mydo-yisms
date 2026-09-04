<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Student;

class StaffApplicantController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('staff/staff-applicant-index');
    }

    public function show($id)
    {
        return Student::findOrFail($id);
    }

    public function getData(Request $request)
    {
        $perPage = (int) $request->input('perpage', 10);
        $search = trim((string) $request->input('search', ''));

        return Student::query()
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
}
