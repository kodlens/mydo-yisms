<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class YouthAuthController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('auth/youth/youth-login-page');
    }

    public function login(Request $req){
        $credentials = $req->validate([
            'email' => ['required', 'email', 'string', 'max:100'],
            'password' => ['required'],
        ]);

        if (Auth::guard('youth')->attempt($credentials)) {
            $req->session()->regenerate();
            $youth = Auth::guard('youth')->user();
            // if ($youth->registration_status !== 'approved') {
            //     return response()->json([
            //         'success' => true,
            //         'status' => $youth->registration_status,
            //         'redirect' => route('youth.youth-dashboard.index'),
            //     ]);
            // }
            return response()->json([
                'success' => true,
                'redirect' => route('youth.youth-dashboard.index'),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid email or password.',
        ], 401);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('youth')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

}
