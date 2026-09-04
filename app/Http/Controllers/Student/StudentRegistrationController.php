<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreStudentRegistrationRequest;
use App\Models\Student;
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
        $validated = $req->validated();
        $documentInputs = ['coe', 'cog', 'sedula', 'school_id'];

        foreach ($documentInputs as $documentInput) {
            unset($validated[$documentInput]);
        }

        $student = Student::create([
            ...$validated,
            'role' => 'student',
            'registration_status' => 'pending',
            'is_active' => true,
        ]);

        $documentFields = [
            'coe' => 'coe_path',
            'cog' => 'cog_path',
            'sedula' => 'cedula_path',
            'school_id' => 'school_id_path',
        ];
        $uploadedFiles = [];
        $folder = $this->documentFolderName($student);

        Storage::disk('public')->makeDirectory('upfiles/' . $folder);

        foreach ($documentFields as $field => $pathColumn) {
            $fileList = $req->input($field);

            if (!empty($fileList[0]['response']['filename'])) {
                $filename = basename($fileList[0]['response']['filename']);
                $from = 'temp/' . $filename;
                $prefixedFilename = $field . '_' . $filename;
                $to = 'upfiles/' . $folder . '/' . $prefixedFilename;
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
                $uploadedFiles[$pathColumn] = $to;
            }
        }

        if (! empty($uploadedFiles)) {
            $student->forceFill($uploadedFiles)->save();
        }

        return response()->json([
            'success' => true,
            'student_id' => $student->id,
            'document_folder' => $folder,
            'uploaded_files' => $uploadedFiles,
        ], 200);

        //return to_route('student-login')->with('status', 'Registration submitted. Please sign in once your account is approved.');
    }

    private function documentFolderName(Student $student): string
    {
        $firstInitial = strtoupper(substr((string) $student->fname, 0, 1));
        $surname = strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', (string) $student->lname));

        return "{$student->id}_{$firstInitial}{$surname}";
    }

}
