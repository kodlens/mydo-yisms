<?php

namespace App\Http\Controllers\Sk;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\SkActivityEvidence;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SkEventActivityController extends Controller
{
    public function index(): Response
    {
        $user = auth('youth')->user();
        $disk = Storage::disk('public');

        $activities = Activity::with('category:id,name')
            ->where('status', 'published')
            ->where('published_at', '<=', now('UTC'))
            ->whereHas('category', fn ($q) => $q->where('is_active', true))
            ->with(['skEvidences' => function ($q) use ($user) {
                $q->where('youth_profile_id', $user->id)->latest();
            }])
            ->withCount('skEvidences')
            ->orderByDesc('starts_at')
            ->orderByDesc('id')
            ->get()
            ->map(function (Activity $activity) use ($disk) {
                $myEvidences = $activity->skEvidences->map(function (SkActivityEvidence $ev) use ($disk) {
                    return [
                        'id' => $ev->id,
                        'description' => $ev->description,
                        'photos' => collect($ev->photos ?? [])
                            ->map(fn ($path) => $disk->url($path))
                            ->values()
                            ->all(),
                        'created_at' => optional($ev->created_at)?->toIso8601String(),
                    ];
                });

                return [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'status' => $activity->status,
                    'category' => $activity->category,
                    'starts_at' => optional($activity->starts_at)?->toIso8601String(),
                    'ends_at' => optional($activity->ends_at)?->toIso8601String(),
                    'venue_name' => $activity->venue_name,
                    'venue_address' => $activity->venue_address,
                    'summary' => $activity->summary,
                    'description' => $activity->description,
                    'is_featured' => $activity->is_featured,
                    'sk_evidences_count' => $activity->sk_evidences_count,
                    'my_evidences' => $myEvidences,
                ];
            });

        return Inertia::render('sk/events-activities/sk-events-activities-page', [
            'xToken' => csrf_token(),
            'activities' => $activities,
        ]);
    }

    public function storeEvidence(Request $request, int $activity): JsonResponse
    {
        $user = auth('youth')->user();
        $activityModel = Activity::where('status', 'published')->findOrFail($activity);

        $validated = $request->validate([
            'description' => ['required', 'string', 'max:2000'],
            'photos' => ['required', 'array', 'min:1', 'max:10'],
        ], [
            'description.required' => 'Please enter a description or narrative for the event evidence.',
            'photos.required' => 'Please upload at least one event picture (PNG, JPG, or JPEG).',
            'photos.min' => 'Please upload at least one event picture (PNG, JPG, or JPEG).',
        ]);

        $disk = Storage::disk('public');
        $tempFilenames = [];

        foreach ($validated['photos'] as $index => $photoItem) {
            $rawFilename = data_get($photoItem, 'response.filename');
            $filename = $rawFilename ? basename((string) $rawFilename) : '';
            $tempPath = "temp/{$filename}";

            if ($filename === '' || ! $disk->exists($tempPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more uploaded event pictures could not be verified. Please re-upload and try again.',
                ], 422);
            }

            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            $mime = $disk->mimeType($tempPath);

            if (! in_array($ext, ['png', 'jpg', 'jpeg'], true) || ! in_array($mime, ['image/png', 'image/jpeg'], true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event evidence pictures must strictly be PNG, JPG, or JPEG images.',
                ], 422);
            }

            $tempFilenames[] = $filename;
        }

        $evidence = DB::transaction(function () use ($activityModel, $user, $validated, $tempFilenames, $disk) {
            $directory = "upfiles/sk-evidences/activity-{$activityModel->id}/sk-{$user->id}";
            $disk->makeDirectory($directory);

            $storedPaths = [];
            foreach ($tempFilenames as $filename) {
                $destination = "{$directory}/evidence_{$filename}";
                $moved = $disk->move("temp/{$filename}", $destination);

                if (! $moved) {
                    throw new \RuntimeException('Failed to move uploaded event picture.');
                }

                $storedPaths[] = $destination;
            }

            return SkActivityEvidence::create([
                'activity_id' => $activityModel->id,
                'youth_profile_id' => $user->id,
                'description' => trim($validated['description']),
                'photos' => $storedPaths,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Event pictures and evidence description uploaded successfully.',
            'data' => [
                'id' => $evidence->id,
                'description' => $evidence->description,
                'photos' => collect($evidence->photos ?? [])
                    ->map(fn ($path) => $disk->url($path))
                    ->values()
                    ->all(),
                'created_at' => optional($evidence->created_at)?->toIso8601String(),
            ],
        ]);
    }

    public function destroyEvidence(int $activity, int $evidence): JsonResponse
    {
        $user = auth('youth')->user();

        $record = SkActivityEvidence::where('activity_id', $activity)
            ->where('youth_profile_id', $user->id)
            ->findOrFail($evidence);

        $disk = Storage::disk('public');
        foreach ($record->photos ?? [] as $path) {
            if ($disk->exists($path)) {
                $disk->delete($path);
            }
        }

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event evidence deleted.',
        ]);
    }
}
