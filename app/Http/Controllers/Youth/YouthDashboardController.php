<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;


class YouthDashboardController extends Controller
{
    public function index(){
        return Inertia::render('youth/youth-dashboard-page');
    }
}
