<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreStudentRegistrationRequest;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StudentRegistrationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('auth/student/student-register',
        [
            'xToken' => csrf_token(),
        ]);
    }

    public function store(StoreStudentRegistrationRequest $request)
    {
        return $request;
        Student::create([
            ...$request->validated(),
            'role' => 'student',
            'registration_status' => 'pending',
            'is_active' => true,
        ]);

        return to_route('student-login')->with('status', 'Registration submitted. Please sign in once your account is approved.');
    }
}
