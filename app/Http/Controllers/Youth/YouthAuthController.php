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
            $youth = Auth::guard('youth')->user();

            if ($youth->status === 'pending') {
                Auth::guard('youth')->logout();
                $req->session()->invalidate();
                $req->session()->regenerateToken();

                return response()->json([
                    'success' => false,
                    'status' => 'pending',
                    'message' => 'Your youth registration is currently pending verification and approval by the MYDO staff. You will be able to sign in once approved.',
                ], 403);
            }

            if ($youth->status === 'rejected') {
                $reason = $youth->rejection_reason ? " Reason: {$youth->rejection_reason}" : '';
                Auth::guard('youth')->logout();
                $req->session()->invalidate();
                $req->session()->regenerateToken();

                return response()->json([
                    'success' => false,
                    'status' => 'rejected',
                    'rejection_reason' => $youth->rejection_reason,
                    'message' => 'Your youth registration was rejected by the MYDO staff.' . $reason,
                ], 403);
            }

            if (!$youth->is_active) {
                Auth::guard('youth')->logout();
                $req->session()->invalidate();
                $req->session()->regenerateToken();

                return response()->json([
                    'success' => false,
                    'status' => 'inactive',
                    'message' => 'Your account is currently inactive. Please contact the MYDO office for assistance.',
                ], 403);
            }

            $req->session()->regenerate();

            return response()->json([
                'success' => true,
                'redirect' => route($youth->dashboardRoute()),
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
