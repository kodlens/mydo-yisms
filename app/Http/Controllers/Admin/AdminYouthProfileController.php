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
            ->with(['barangay', 'city', 'province', 'scholarshipApplications.scholarshipType', 'approver:id,fname,lname']);

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

        if ($status === 'pending') {
            $query->where('status', 'pending');
        } elseif ($status === 'approved') {
            $query->where('status', 'approved');
        } elseif ($status === 'rejected') {
            $query->where('status', 'rejected');
        } elseif ($status === 'enrolled') {
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
        } elseif ($status === 'sk') {
            $query->where('role', 'sk');
        } elseif ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    public function approve(Request $req, $id)
    {
        $youth = YouthProfile::findOrFail($id);
        $old = $youth->toArray();

        $youth->update([
            'status' => 'approved',
            'is_active' => true,
            'approved_by' => $req->user()->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        ActivityLogger::log(
            'youth_profile.approved',
            "Approved youth registration for: {$youth->fname} {$youth->lname} (Ref: {$youth->reference_code})",
            $youth,
            $old,
            $youth->fresh()->toArray(),
            ['youth_profile_id' => $youth->id, 'reference_code' => $youth->reference_code]
        );

        return response()->json([
            'success' => true,
            'message' => "Youth profile for {$youth->fname} {$youth->lname} has been approved successfully.",
        ]);
    }

    public function reject(Request $req, $id)
    {
        $req->validate([
            'rejection_reason' => ['nullable', 'string', 'max:500'],
        ]);

        $youth = YouthProfile::findOrFail($id);
        $old = $youth->toArray();

        $youth->update([
            'status' => 'rejected',
            'is_active' => false,
            'rejection_reason' => $req->input('rejection_reason'),
        ]);

        ActivityLogger::log(
            'youth_profile.rejected',
            "Rejected youth registration for: {$youth->fname} {$youth->lname} (Ref: {$youth->reference_code})",
            $youth,
            $old,
            $youth->fresh()->toArray(),
            [
                'youth_profile_id' => $youth->id,
                'reference_code' => $youth->reference_code,
                'reason' => $req->input('rejection_reason'),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Youth registration for {$youth->fname} {$youth->lname} has been rejected.",
        ]);
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
