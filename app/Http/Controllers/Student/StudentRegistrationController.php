<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreStudentRegistrationRequest;
use App\Models\Youth;
use App\Models\YouthProfile;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

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

        [$student, $profile] = DB::transaction(function () use ($validated) {
            $student = Youth::create([
                ...$validated,
                'role' => 'youth',
                'registration_status' => 'approved',
                'is_active' => true,
            ]);

            $profile = YouthProfile::create([
                ...$this->profileData($validated),
                'student_id' => $student->id,
                'is_active' => true,
            ]);

            return [$student, $profile];
        });

        return response()->json([
            'success' => true,
            'youth_id' => $student->id,
            'youth_profile_id' => $profile->id,
        ], 200);

        //return to_route('youth-login.index')->with('status', 'Registration submitted. Please sign in once your account is approved.');
    }

    private function profileData(array $validated): array
    {
        return collect($validated)
            ->only([
                'lname',
                'fname',
                'mname',
                'suffix',
                'birth_date',
                'sex',
                'civil_status',
                'mobile_number',
                'provCode',
                'citymunCode',
                'brgyCode',
                'street_address',
                'zip_code',
                'school_name',
                'program',
                'year',
                'previous_semester_gwa',
                'guardian_name',
                'guardian_contact_number',
                'monthly_family_income',
            ])
            ->all();
    }

}
