<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class YouthScholarshipController extends Controller
{
    public function index(): Response
    {
        $user = Auth::guard('youth')->user();

        $activeApplication = null;
        if ($user) {
            $activeApplication = ScholarshipApplication::with(['scholarshipType:id,scholarship,amount', 'academicYear:id,name,code'])
                ->where('youth_profile_id', $user->id)
                ->whereIn('status', ['pending', 'approved'])
                ->orderByRaw("CASE WHEN status = 'approved' THEN 0 ELSE 1 END")
                ->latest()
                ->first();
        }

        return Inertia::render('youth/services/scholarships/youth-scholarships-page', [
            'activeApplication' => $activeApplication,
        ]);
    }

    public function getData(Request $req)
    {
        $perPage = (int) $req->input('perpage', 10);
        $search = trim((string) $req->input('search', ''));
        $user = Auth::guard('youth')->user();

        $query = ScholarshipType::query()
            ->where('is_active', 1)
            ->when($search !== '', function ($q) use ($search) {
                $q->where('scholarship', 'like', "%{$search}%")
                    ->orWhere('target_beneficiary', 'like', "%{$search}%")
                    ->orWhere('benefit', 'like', "%{$search}%");
            });

        if ($user) {
            $query->with(['applications' => function ($q) use ($user) {
                $q->where('youth_profile_id', $user->id)
                    ->orderByRaw("CASE WHEN status = 'approved' THEN 0 WHEN status = 'pending' THEN 1 ELSE 2 END")
                    ->latest();
            }]);
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }
}
