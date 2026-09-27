<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActivityCategory;
use Inertia\Inertia;
use Inertia\Response;

class AdminActivityCategoryController extends Controller
{
    public function index(){
        return Inertia::render('admin/activity-categories/admin-activity-categories-page');
    }

    public function getData(Request $req){

        $perPage = (int) $req->input('perpage', 10);
        $search = trim((string) $req->input('search', ''));

        $data = ActivityCategory::when($search !== '', function($q) use ($search){
            $q->where('scholarship', 'like', "%{$search}%");
        })
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return $data;
    }
}
