<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class YouthApplyScholarshipController extends Controller
{
    public function index(){
        return Inertia::render('youth/services/scholarships/youth-apply-scholarship-page');
    }
}
