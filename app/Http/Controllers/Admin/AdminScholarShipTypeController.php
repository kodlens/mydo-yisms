<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\ScholarshipType;

class AdminScholarShipTypeController extends Controller
{
    public function index(){
        return Inertia::render('admin/scholarship-types/admin-scholarship-types-page');
    }

    public function getData(Request $req){

        $perPage = (int) $req->input('perpage', 10);
        $search = trim((string) $req->input('search', ''));

        $data = ScholarshipType::when($search !== '', function($q) use ($search){
            $q->where('scholarship', 'like', "%{$search}%");
        })
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return $data;
    }




}
