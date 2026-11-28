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
        $youthUser = auth('youth')->user();
        $webUser = auth('web')->user();
        $user = $youthUser ?? $webUser;
        $isYouthGuard = $youthUser !== null;

        if ($isYouthGuard && empty($youthUser->reference_code)) {
            $youthUser->reference_code = YouthProfile::generateUniqueReferenceCode('SK');
            $youthUser->save();
        }

        $profile = $isYouthGuard
            ? YouthProfile::with(['barangay', 'city', 'province'])->find($youthUser->id)
            : \App\Models\User::with(['barangay', 'city', 'province'])->find($webUser->id);

        $activeAcademicYear = AcademicYear::where('is_active', true)->first();

        $brgyCode = $profile?->brgyCode;

        $barangayYouthCount = YouthProfile::when($brgyCode, fn ($q) => $q->where('brgyCode', $brgyCode))
            ->where('role', 'youth')
            ->where('status', 'approved')
            ->count();

        $barangaySkCount = YouthProfile::when($brgyCode, fn ($q) => $q->where('brgyCode', $brgyCode))
            ->where('role', 'sk')
            ->where('status', 'approved')
            ->count()
            + \App\Models\User::where('role', 'sk')
                ->when($brgyCode, fn ($q) => $q->where('brgyCode', $brgyCode))
                ->count();

        $publishedEventsCount = Activity::where('status', 'published')->count();

        $ownerColumn = $isYouthGuard ? 'youth_profile_id' : 'user_id';
        $myEvidenceCount = SkActivityEvidence::where($ownerColumn, $user->id)->count();

        $recentEvidences = SkActivityEvidence::with(['activity.category:id,name'])
            ->where($ownerColumn, $user->id)
            ->latest()
            ->take(4)
            ->get()
            ->map(function (SkActivityEvidence $evidence) {
                $photoUrls = collect($evidence->photos ?? [])
                    ->map(fn ($path) => '/storage/' . ltrim(preg_replace('/^\/?storage\//', '', (string) $path), '/'))
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
            ->withCount(['skEvidences as my_evidence_count' => function ($q) use ($ownerColumn, $user) {
                $q->where($ownerColumn, $user->id);
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
