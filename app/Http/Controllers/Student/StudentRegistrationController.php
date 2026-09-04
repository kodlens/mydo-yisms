<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreStudentRegistrationRequest;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class StudentRegistrationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('auth/student/student-register',
        [
            'xToken' => csrf_token(),
        ]);
    }

    public function store(StoreStudentRegistrationRequest $req)
    {
        Student::create([
            ...$request->validated(),
            'role' => 'student',
            'registration_status' => 'pending',
            'is_active' => true,
        ]);

        $documentFields = ['coe', 'cog', 'sedula', 'school_id'];
        $uploadedFiles = [];

        foreach ($documentFields as $field) {
            $fileList = $req->input($field);

            if (!empty($fileList[0]['response']['filename'])) {
                $filename = basename($fileList[0]['response']['filename']);
                $from = 'temp/' . $filename;
                $to = 'upfiles/' . $filename;
                $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
                $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

                if (!in_array($extension, $allowedExtensions, true)) {
                    continue;
                }

                if (!Storage::disk('public')->exists($from)) {
                    continue;
                }

                if (Storage::disk('public')->size($from) > 5 * 1024 * 1024) {
                    continue;
                }

                Storage::disk('public')->move($from, $to);
                $uploadedFiles[$field] = $to;
            }
        }

        return response()->json([
            'success' => true,
            'uploaded_files' => $uploadedFiles,
        ], 200);

        //return to_route('student-login')->with('status', 'Registration submitted. Please sign in once your account is approved.');
    }


}
