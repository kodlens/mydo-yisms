<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\YouthProfile;

class StaffYouthProfileController extends Controller
{
    public function index(){
        return Inertia::render('staff/youth-profiles/staff-youth-profiles-page');
    }

    public function getData(Request $req){

        $perPage = (int) $req->input('perpage', 10);
        $search = trim((string) $req->input('search', ''));
        $status = $req->input('status');

        $query = YouthProfile::query()
            ->with(['barangay', 'city', 'province', 'scholarshipApplications.scholarshipType']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('lname', 'like', "%{$search}%")
                    ->orWhere('fname', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('reference_code', 'like', "%{$search}%")
                    ->orWhere('school_name', 'like', "%{$search}%")
                    ->orWhere('program', 'like', "%{$search}%");
            });
        }

        if ($status === 'enrolled') {
            $query->where('is_graduated', false)
                ->whereNotNull('school_name')
                ->where('school_name', '!=', '');
        } elseif ($status === 'out_of_school') {
            $query->where('is_graduated', false)
                ->where(function ($q) {
                    $q->whereNull('school_name')->orWhere('school_name', '');
                });
        } elseif ($status === 'graduated') {
            $query->where('is_graduated', true);
        } elseif ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);

    }
}
