<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\ScholarshipType;

class YouthScholarshipController extends Controller
{
    public function index(){
        return Inertia::render('youth/services/scholarships/youth-scholarships-page');
    }

     public function getData(Request $req){

        $perPage = (int) $req->input('perpage', 10);
        $search = trim((string) $req->input('search', ''));

        $data = ScholarshipType::when($search !== '', function($q) use ($search){
            $q->where('scholarship', 'like', "%{$search}%");
        })
            ->where('is_active', 1)
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return $data;
    }
}
