<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;


class YouthApplyScholarshipController extends Controller
{
    public function index($id){
        return Inertia::render('youth/services/scholarships/youth-apply-scholarship-page',[
            'xToken' => csrf_token(),
            'scholarshipTypeId' => $id
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


        //return $validated['coe'][0]['response']['filename]
        //originalName = $validate['coe']['0]['name']

        $coeFilename = $validated['coe'][0]['response']['filename'] ?? '';
        $cogFilename = $validated['cog'][0]['response']['filename'] ?? '';
        $cedulaFilename = $validated['cedula'][0]['response']['filename'] ?? '';
        $schoolIdFilename = $validated['school_id'][0]['response']['filename'] ?? '';

        $userFolderName = $user->id . '_'. $user->fname[0] . $user->lname;

        if (Storage::disk('public')->exists('temp/' . $coeFilename)) {
            // File exists

            Storage::disk('public')->move(
                'temp/' . $coeFilename,
                'upfiles/' . $coeFilename
            );
            return $coeFilename;
        }

        if (Storage::disk('public')->exists('temp/' . $cogFilename)) {
            // File exists
            return $coeFilename;
        }

        if (Storage::disk('public')->exists('temp/' . $cedulaFilename)) {
            // File exists
            return $coeFilename;
        }

        if (Storage::disk('public')->exists('temp/' . $schoolIdFilename)) {
            // File exists
            return $coeFilename;
        }

        return [];

        $user = Auth::guard('youth')->user();

        ScholarshipApplication::create([
            'youth_profile_id' => $user->id,
            'scholarship_type_id' => $validated['scholarship_type_id'],
            'coe_path' => $coeFilename,
            'cedula_path' => $cedulaFilename,
            'school_id_path' => $schoolIdFilename,
            'status' => 'pending',
            'submitted_at' => now()
        ]);


        return response()->json([
            'success' => true,
            'message' => 'Application successfully saved.'
        ], 200);




    }
}
