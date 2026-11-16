<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Activity;
use App\Models\ActivityAttendance;
use App\Models\ActivityRegistration;
use App\Models\CashIncentiveBeneficiary;
use App\Models\ScholarshipApplication;
use App\Models\YouthProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class YouthDashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth('youth')->user();

        if ($user && empty($user->reference_code)) {
            $user->reference_code = YouthProfile::generateUniqueReferenceCode();
            $user->save();
        }

        $profile = YouthProfile::with(['barangay', 'city', 'province'])->find($user->id);

        $activeAcademicYear = AcademicYear::where('is_active', true)->first();

        $scholarshipApplications = ScholarshipApplication::with(['scholarshipType', 'academicYear'])
            ->where('youth_profile_id', $user->id)
            ->orderByDesc('id')
            ->take(5)
            ->get();

        $scholarshipStats = [
            'total' => ScholarshipApplication::where('youth_profile_id', $user->id)->count(),
            'pending' => ScholarshipApplication::where('youth_profile_id', $user->id)->where('status', 'pending')->count(),
            'approved' => ScholarshipApplication::where('youth_profile_id', $user->id)->where('status', 'approved')->count(),
            'rejected' => ScholarshipApplication::where('youth_profile_id', $user->id)->where('status', 'rejected')->count(),
        ];

        $registeredActivitiesCount = ActivityRegistration::where('youth_profile_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->count();

        $attendedActivitiesCount = ActivityAttendance::where('youth_profile_id', $user->id)->count();

        $upcomingActivities = Activity::with('category:id,name')
            ->where('status', 'published')
            ->where('ends_at', '>', now('UTC'))
            ->withExists(['registrations as has_joined' => function ($q) use ($user) {
                $q->where('youth_profile_id', $user->id)->whereIn('status', ['pending', 'approved']);
            }])
            ->orderBy('starts_at')
            ->take(3)
            ->get();

        $cashIncentivesCount = CashIncentiveBeneficiary::where('youth_profile_id', $user->id)->count();

        return Inertia::render('youth/youth-dashboard-page', [
            'profile' => $profile,
            'activeAcademicYear' => $activeAcademicYear,
            'scholarshipStats' => $scholarshipStats,
            'scholarshipApplications' => $scholarshipApplications,
            'registeredActivitiesCount' => $registeredActivitiesCount,
            'attendedActivitiesCount' => $attendedActivitiesCount,
            'upcomingActivities' => $upcomingActivities,
            'cashIncentivesCount' => $cashIncentivesCount,
        ]);
    }
}

