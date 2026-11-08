<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\YouthProfile;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminYouthProfileController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/youth-profiles/admin-youth-profiles-page');
    }

    public function getData(Request $req)
    {
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

    public function changePassword(Request $req, $id)
    {
        $req->validate([
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $youth = YouthProfile::findOrFail($id);
        $youth->password = Hash::make($req->password);
        $youth->save();

        ActivityLogger::log(
            'password_change',
            "Changed password for youth profile: {$youth->fname} {$youth->lname} (Ref: {$youth->reference_code})",
            $youth,
            null,
            null,
            ['youth_profile_id' => $youth->id, 'reference_code' => $youth->reference_code]
        );

        return response()->json([
            'status' => 'changed',
            'message' => 'Youth profile password changed successfully.',
        ], 200);
    }
}
