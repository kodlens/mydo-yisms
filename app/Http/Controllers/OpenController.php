<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Province;
use App\Models\City;
use App\Models\Barangay;
class OpenController extends Controller
{
    public function loadProvinces()
    {
        $provinces = \App\Models\Province::where('active', 1)->orderBy('provDesc', 'asc')->get();
        return response()->json($provinces);
    }

    public function loadCities(Request $req)
    {
        $cities = \App\Models\City::where('active', 1)
            ->where('provCode', $req->provCode)
            ->orderBy('citymunDesc', 'asc')->get();
        return response()->json($cities);
    }

    public function loadBarangays(Request $req)
    {
        $barangays = \App\Models\Barangay::where('active', 1)
            ->where('provCode', $req->provCode)
            ->where('citymunCode', $req->cityCode)
            ->orderBy('brgyDesc', 'asc')->get();
        return response()->json($barangays);
    }

}
