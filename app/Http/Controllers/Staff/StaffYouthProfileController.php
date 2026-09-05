<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StaffYouthProfileController extends Controller
{
    public function index(){
        return Inertia::render('staff/youth-profiles/youth-profiles-page');
    }

    public function getData(Request $req){

        $perPage = (int) $req->input('perpage', 10);
        $search = trim((string) $req->input('search', ''));
        $status = $req->input('status');

        $data = YouthProfile::when($search !== '', function($q){
            $q->where('lnme', 'like', "%{$search}%");
        })
            ->orderBy('id', 'desc')
            ->get();

        return $data;

    }
}
