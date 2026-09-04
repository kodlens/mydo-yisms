<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class StaffDashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('staff/staff-dashboard-index');
    }
}
