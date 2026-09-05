<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Youth\StoreYouthRegistrationRequest;
use App\Models\YouthProfile;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class YouthRegistrationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('auth/youth/youth-register-page',
        [
            'xToken' => csrf_token(),
        ]);
    }

    public function store(StoreYouthRegistrationRequest $req)
    {
        //return $req;
        $validated = $req->validated();

        // DB::transaction(function () use ($validated) {
        //     return [$student, $profile];
        // });
         $youth = YouthProfile::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'role' => 'youth',
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
        ], 200);

        //return to_route('youth-login.index')->with('status', 'Registration submitted. Please sign in once your account is approved.');
    }

}
