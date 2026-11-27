<?php

namespace App\Http\Controllers\Sk;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SkAuthController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('auth/sk/sk-login-page');
    }

    public function login(Request $req)
    {
        $credentials = $req->validate([
            'email' => ['required', 'email', 'string', 'max:100'],
            'password' => ['required'],
        ]);

        if (Auth::guard('youth')->attempt($credentials)) {
            $user = Auth::guard('youth')->user();

            if ($user->role !== 'sk') {
                Auth::guard('youth')->logout();
                $req->session()->invalidate();
                $req->session()->regenerateToken();

                return response()->json([
                    'success' => false,
                    'status' => 'denied',
                    'message' => 'This sign-in portal is exclusively for Sangguniang Kabataan (SK) Officials. Please use the Youth Portal Sign In for student/youth accounts.',
                ], 403);
            }

            if ($user->status === 'pending') {
                Auth::guard('youth')->logout();
                $req->session()->invalidate();
                $req->session()->regenerateToken();

                return response()->json([
                    'success' => false,
                    'status' => 'pending',
                    'message' => 'Your SK Official registration is currently pending verification and approval by the MYDO staff. You will be able to sign in once approved.',
                ], 403);
            }

            if ($user->status === 'rejected') {
                $reason = $user->rejection_reason ? " Reason: {$user->rejection_reason}" : '';
                Auth::guard('youth')->logout();
                $req->session()->invalidate();
                $req->session()->regenerateToken();

                return response()->json([
                    'success' => false,
                    'status' => 'rejected',
                    'rejection_reason' => $user->rejection_reason,
                    'message' => 'Your SK Official registration was rejected by the MYDO staff.' . $reason,
                ], 403);
            }

            if (! $user->is_active) {
                Auth::guard('youth')->logout();
                $req->session()->invalidate();
                $req->session()->regenerateToken();

                return response()->json([
                    'success' => false,
                    'status' => 'inactive',
                    'message' => 'Your SK account is currently inactive. Please contact the MYDO office for assistance.',
                ], 403);
            }

            $req->session()->regenerate();

            return response()->json([
                'success' => true,
                'redirect' => route('sk.dashboard.index'),
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
