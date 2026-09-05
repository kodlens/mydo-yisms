<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;



class YouthMyProfileController extends Controller
{
    public function index(){

        $youth = Auth::guard('youth')->user();
        $youth->load(['province', 'city', 'barangay']);

        return Inertia::render('youth/my-profile/youth-my-profile-page', [
            'youth' => $youth
        ]);
    }


}
