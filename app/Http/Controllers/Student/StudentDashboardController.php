<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;


class StudentDashboardController extends Controller
{
    public function index(){
        return Inertia::render('student/student-dashboard-index');
    }
}
