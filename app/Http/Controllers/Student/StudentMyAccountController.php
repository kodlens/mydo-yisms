<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class StudentMyAccountController extends Controller
{
    public function index(){
        $student = Auth::guard('youth')->user();

        //return $student;
        return Inertia::render('student/my-account/my-account-index', [
            'student' => $student
        ]);
    }
}
