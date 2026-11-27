<?php

namespace App\Http\Controllers\Sk;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Activity;
use App\Models\SkActivityEvidence;
use App\Models\YouthProfile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SkDashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth('youth')->user();

        if ($user && empty($user->reference_code)) {
            $user->reference_code = YouthProfile::generateUniqueReferenceCode('SK');
            $user->save();
        }

        $profile = YouthProfile::with(['barangay', 'city', 'province'])->find($user->id);
        $activeAcademicYear = AcademicYear::where('is_active', true)->first();

        $barangayYouthCount = YouthProfile::where('brgyCode', $user->brgyCode)
            ->where('role', 'youth')
            ->where('status', 'approved')
            ->count();

        $barangaySkCount = YouthProfile::where('brgyCode', $user->brgyCode)
            ->where('role', 'sk')
            ->where('status', 'approved')
            ->count();

        $publishedEventsCount = Activity::where('status', 'published')->count();
        $myEvidenceCount = SkActivityEvidence::where('youth_profile_id', $user->id)->count();

        $recentEvidences = SkActivityEvidence::with(['activity.category:id,name'])
            ->where('youth_profile_id', $user->id)
            ->latest()
            ->take(4)
            ->get()
            ->map(function (SkActivityEvidence $evidence) {
                $disk = Storage::disk('public');
                $photoUrls = collect($evidence->photos ?? [])
                    ->map(fn ($path) => $disk->url($path))
                    ->values()
                    ->all();

                return [
                    'id' => $evidence->id,
                    'activity_id' => $evidence->activity_id,
                    'activity_title' => $evidence->activity?->title ?? 'Municipal Activity',
                    'activity_category' => $evidence->activity?->category?->name ?? 'Community',
                    'description' => $evidence->description,
                    'photos' => $photoUrls,
                    'created_at' => optional($evidence->created_at)?->toIso8601String(),
                ];
            });

        $upcomingActivities = Activity::with('category:id,name')
            ->where('status', 'published')
            ->where('published_at', '<=', now('UTC'))
            ->withCount(['skEvidences as my_evidence_count' => function ($q) use ($user) {
                $q->where('youth_profile_id', $user->id);
            }])
            ->orderByDesc('starts_at')
            ->take(4)
            ->get();

        return Inertia::render('sk/sk-dashboard-page', [
            'profile' => $profile,
            'activeAcademicYear' => $activeAcademicYear,
            'stats' => [
                'barangayYouthCount' => $barangayYouthCount,
                'barangaySkCount' => $barangaySkCount,
                'publishedEventsCount' => $publishedEventsCount,
                'myEvidenceCount' => $myEvidenceCount,
            ],
            'recentEvidences' => $recentEvidences,
            'upcomingActivities' => $upcomingActivities,
        ]);
    }
}
