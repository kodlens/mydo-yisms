<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Support\FileMover;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipType;


class YouthApplyScholarshipController extends Controller
{
    public function index($id){

        $user = Auth::guard('youth')->user();
        $scholarshipType = ScholarshipType::find($id);

        $scholarshipApplication = ScholarshipApplication::where('youth_profile_id', $user->id)
            ->where('scholarship_type_id', $id)
            ->first();

        return Inertia::render('youth/services/scholarships/youth-apply-scholarship-page',[
            'xToken' => csrf_token(),
            'scholarshipType' => $scholarshipType,
            'scholarshipApplication' => $scholarshipApplication
        ]);
    }

    public function store(Request $req, $scholarship){

        //return $req;;

        $validated = $req->validate([
            'scholarship_type_id' => ['required', 'string'],
            'coe' => ['array', 'required'],
            'cog' => ['array', 'required'],
            'cedula' => ['array', 'required'],
            'school_id' => ['array', 'required']
        ]);

        $files = [
            'coe' => $validated['coe'][0]['response']['filename'] ?? null,
            'cog' => $validated['cog'][0]['response']['filename'] ?? null,
            'cedula' => $validated['cedula'][0]['response']['filename'] ?? null,
            'school_id' => $validated['school_id'][0]['response']['filename'] ?? null,
        ];

        $user = Auth::guard('youth')->user();
        $fileMover = new FileMover($user);

        $movedFiles = $fileMover->moveFromTemp($files);


        ScholarshipApplication::create([
            'youth_profile_id' => $user->id,
            'scholarship_type_id' => $validated['scholarship_type_id'],
            'coe_path' => $movedFiles['coe']['path'] ?? null,
            'cog_path' => $movedFiles['cog']['path'] ?? null,
            'cedula_path' => $movedFiles['cedula']['path'] ?? null,
            'school_id_path' => $movedFiles['school_id']['path'] ?? null,
            'status' => 'pending',
            'submitted_at' => now()
        ]);


        return response()->json([
            'success' => true,
            'message' => 'Application successfully saved.'
        ], 200);




    }
}
