<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PendingPageController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('student/pending-page', [
            'youth' => $request->user('youth'),
            'student' => $request->user('youth'),
        ]);
    }
}
