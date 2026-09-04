<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class AuthController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('auth/student/student-login');
    }

    public function login(Request $req){
         $credentials = $req->validate([
            'email' => ['required', 'email', 'string', 'max:100'],
            'password' => ['required'],
        ]);

        if (Auth::guard('student')->attempt($credentials)) {
            $req->session()->regenerate();


            // return redirect()->route('student.dashboard');
            return response()->json([
                'success' => true,
                'redirect' => route('student.dashboard'),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid email or password.',
        ], 401);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('student')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

}
