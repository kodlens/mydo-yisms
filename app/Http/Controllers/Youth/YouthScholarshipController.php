<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\ScholarshipType;
use Illuminate\Support\Facades\Auth;

class YouthScholarshipController extends Controller
{
    public function index(){
        return Inertia::render('youth/services/scholarships/youth-scholarships-page');
    }

    public function getData(Request $req){

        $perPage = (int) $req->input('perpage', 10);
        $search = trim((string) $req->input('search', ''));
        $user = Auth::guard('youth')->user();
        $acadYear = \App\Models\AcademicYear::where('is_active', 1)->first();

        $query = ScholarshipType::query()
            ->where('is_active', 1)
            ->when($search !== '', function($q) use ($search){
                $q->where('scholarship', 'like', "%{$search}%")
                    ->orWhere('target_beneficiary', 'like', "%{$search}%")
                    ->orWhere('benefit', 'like', "%{$search}%");
            });

        if ($user && $acadYear) {
            $query->with(['applications' => function ($q) use ($user, $acadYear) {
                $q->where('youth_profile_id', $user->id)
                    ->where('academic_year_id', $acadYear->id);
            }]);
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }



}
