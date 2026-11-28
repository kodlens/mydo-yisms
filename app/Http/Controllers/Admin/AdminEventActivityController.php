<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\ActivityLog;
use App\Models\ActivityRegistration;
use App\Models\SkActivityEvidence;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminEventActivityController extends Controller
{
    /** The statuses an activity is allowed to be saved as. */
    private const STATUSES = ['draft', 'published', 'cancelled', 'archived'];

    public function index(): Response
    {
        return Inertia::render('admin/events-activities/admin-events-activities-page');
    }

    public function data(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('perpage', 10);
        $search = trim((string) $request->input('search', ''));
        $status = trim((string) $request->input('status', ''));

        $query = Activity::query()
            ->with('category:id,name,slug,is_active')
            ->withCount([
                'registrations',
                'registrations as approved_registrations_count' => fn ($q) => $q->reservingSlot(),
                'registrations as pending_registrations_count' => fn ($q) => $q->where('status', 'pending'),
                'skEvidences as sk_evidences_count',
                'attendances as attendances_count',
            ]);

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if (in_array($status, self::STATUSES, true)) {
            $query->where('status', $status);
        }

        $query->orderBy('starts_at');

        return response()->json($query->paginate($perPage));
    }

    public function categories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->categoryOptions(),
        ]);
    }

    public function skEvidences(int $id): JsonResponse
    {
        $activity = Activity::with(['skEvidences' => function ($query) {
            $query->with(['skOfficial.barangay', 'skOfficial.city', 'skUser.barangay', 'skUser.city'])->latest();
        }])->findOrFail($id);

        $evidences = $activity->skEvidences->map(function (SkActivityEvidence $evidence) {
            $sk = $evidence->skOfficial ?? $evidence->skUser;
            $fullName = trim(implode(' ', array_filter([
                $sk?->fname,
                $sk?->mname,
                $sk?->lname,
                $sk?->suffix,
            ]))) ?: 'SK Official';

            return [
                'id' => $evidence->id,
                'description' => $evidence->description,
                'photos' => collect($evidence->photos ?? [])
                    ->map(fn ($path) => '/storage/' . ltrim(preg_replace('/^\/?storage\//', '', (string) $path), '/'))
                    ->values()
                    ->all(),
                'created_at' => optional($evidence->created_at)?->toIso8601String(),
                'sk_official' => [
                    'id' => $sk?->id,
                    'full_name' => $fullName,
                    'reference_code' => $sk?->reference_code ?? ($sk?->username ? "USER: {$sk->username}" : null),
                    'sk_position' => $sk?->sk_position ?? 'SK Official',
                    'barangay' => $sk?->barangay?->brgyDesc ?? $sk?->brgyCode ?? 'Municipal SK',
                    'city' => $sk?->city?->citymunDesc ?? '—',
                    'email' => $sk?->email,
                    'mobile_number' => $sk?->mobile_number ?? null,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'activity' => [
                'id' => $activity->id,
                'title' => $activity->title,
                'venue_name' => $activity->venue_name,
                'starts_at' => optional($activity->starts_at)?->toIso8601String(),
            ],
            'evidences' => $evidences,
        ]);
    }

    public function participantsPage(int $id): Response
    {
        $activity = Activity::findOrFail($id);

        return Inertia::render('admin/events-activities/admin-activity-participants-page', [
            'activity' => [
                'id' => $activity->id,
                'title' => $activity->title,
                'starts_at' => optional($activity->starts_at)?->toIso8601String(),
                'ends_at' => optional($activity->ends_at)?->toIso8601String(),
                'venue_name' => $activity->venue_name,
                'venue_address' => $activity->venue_address,
                'capacity' => $activity->capacity,
                'requires_approval' => $activity->requires_approval,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/events-activities/admin-create-edit-events-activities', [
            'activity' => null,
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules(), $this->messages());

        if (! empty($validated['is_featured'])) {
            Activity::where('is_featured', true)->update(['is_featured' => false]);
        }

        $attributes = $this->attributesFrom($validated);
        if ($attributes['status'] === 'published') {
            $attributes['published_at'] = now();
        }

        $activity = Activity::create([
            ...$attributes,
            'created_by' => $request->user()?->id,
        ]);

        $this->logAction(
            $request->user(),
            'activity.created',
            "Created event/activity \"{$activity->title}\".",
            $activity->id,
            null,
            $activity->toArray()
        );

        return response()->json([
            'message' => 'Event/activity created successfully.',
            'success' => true,
            'data' => $activity->load('category:id,name,slug,is_active'),
        ], 201);
    }

    public function edit(int $id): Response
    {
        $activity = Activity::with('category:id,name,slug,is_active')->findOrFail($id);

        return Inertia::render('admin/events-activities/admin-create-edit-events-activities', [
            'activity' => $activity,
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);
        $oldValues = $activity->toArray();

        $validated = $request->validate($this->rules(), $this->messages());

        if (! empty($validated['is_featured'])) {
            Activity::where('id', '!=', $activity->id)
                ->where('is_featured', true)
                ->update(['is_featured' => false]);
        }

        $attributes = $this->attributesFrom($validated, $activity->id);

        if ($attributes['status'] === 'published' && $activity->published_at === null) {
            $attributes['published_at'] = now();
        }

        $activity->update($attributes);

        $this->logAction(
            $request->user(),
            'activity.updated',
            "Updated event/activity \"{$activity->title}\".",
            $activity->id,
            $oldValues,
            $activity->fresh()?->toArray()
        );

        return response()->json([
            'message' => 'Event/activity updated successfully.',
            'success' => true,
            'data' => $activity->fresh('category:id,name,slug,is_active'),
        ]);
    }

    public function toggleFeatured(Request $request, int $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);
        $newFeatured = ! $activity->is_featured;

        if ($newFeatured) {
            Activity::where('id', '!=', $activity->id)
                ->where('is_featured', true)
                ->update(['is_featured' => false]);
        }

        $activity->update(['is_featured' => $newFeatured]);

        $this->logAction(
            $request->user(),
            'activity.featured_toggled',
            ($newFeatured ? 'Featured' : 'Unfeatured') . " event/activity \"{$activity->title}\".",
            $activity->id
        );

        return response()->json([
            'message' => $newFeatured
                ? '“' . $activity->title . '” is now set as the featured event.'
                : '“' . $activity->title . '” is no longer featured.',
            'success' => true,
            'is_featured' => $newFeatured,
            'data' => $activity->fresh('category:id,name,slug,is_active'),
        ]);
    }

    public function participants(Request $request, int $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);
        $status = trim((string) $request->input('status', ''));

        $query = $activity->registrations()->with(['youthProfile', 'attendance']);

        if (in_array($status, ['pending', 'approved', 'rejected', 'cancelled'], true)) {
            $query->where('status', $status);
        }

        $participants = $query
            ->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 WHEN 'rejected' THEN 2 ELSE 3 END")
            ->orderByDesc('registered_at')
            ->get()
            ->map(fn (ActivityRegistration $registration) => $this->participantRow($registration));

        $reserved = $activity->registrations()->reservingSlot()->count();

        return response()->json([
            'success' => true,
            'activity' => [
                'id' => $activity->id,
                'title' => $activity->title,
                'capacity' => $activity->capacity,
                'requires_approval' => $activity->requires_approval,
                'reserved_count' => $reserved,
                'slots_left' => $activity->capacity === null ? null : max(0, $activity->capacity - $reserved),
            ],
            'participants' => $participants,
        ]);
    }

    public function updateParticipant(Request $request, int $id, int $registration): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'rejection_reason' => ['nullable', 'string', 'max:500'],
        ], $this->messages());

        $registrationRecord = $activity->registrations()->whereKey($registration)->firstOrFail();

        if ($validated['status'] === 'approved') {
            $others = $activity->registrations()
                ->reservingSlot()
                ->whereKeyNot($registrationRecord->id)
                ->count();

            if ($activity->capacity !== null && $others >= $activity->capacity) {
                return response()->json([
                    'message' => 'This activity is already at capacity. Raise the capacity or reject a sign-up first.',
                    'success' => false,
                ], 422);
            }
        }

        $reason = trim((string) ($validated['rejection_reason'] ?? ''));

        if ($validated['status'] === 'rejected' && $reason === '') {
            return response()->json([
                'message' => 'Give a reason so the youth knows why they were not accepted.',
                'success' => false,
            ], 422);
        }

        $registrationRecord->update([
            'status' => $validated['status'],
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'rejection_reason' => $validated['status'] === 'rejected' ? $reason : null,
        ]);

        return response()->json([
            'message' => $validated['status'] === 'approved' ? 'Sign-up approved.' : 'Sign-up rejected.',
            'success' => true,
            'data' => $this->participantRow($registrationRecord->refresh()->load(['youthProfile', 'attendance'])),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $activity = Activity::withCount([
            'registrations',
            'registrations as reserved_registrations_count' => fn ($q) => $q->reservingSlot(),
        ])->findOrFail($id);

        if ($activity->reserved_registrations_count > 0) {
            return response()->json([
                'message' => "{$activity->reserved_registrations_count} youth registration(s) still point to this activity. Archive it instead of deleting it.",
                'success' => false,
            ], 422);
        }

        $oldValues = $activity->toArray();
        $title = $activity->title;
        $activityId = $activity->id;

        $activity->registrations()->delete();
        $activity->delete();

        $this->logAction(
            $request->user(),
            'activity.deleted',
            "Deleted event/activity \"{$title}\".",
            $activityId,
            $oldValues,
            null
        );

        return response()->json([
            'message' => 'Event/activity successfully deleted.',
            'success' => true,
        ]);
    }

    private function logAction(
        ?User $actor,
        string $action,
        string $description,
        int $subjectId,
        ?array $oldValues = null,
        ?array $newValues = null
    ): void {
        if (! $actor) {
            return;
        }

        ActivityLog::create([
            'user_id' => $actor->id,
            'actor_name' => trim("{$actor->fname} {$actor->lname}") ?: $actor->username,
            'actor_role' => $actor->role,
            'action' => $action,
            'description' => $description,
            'subject_type' => Activity::class,
            'subject_id' => $subjectId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    private function categoryOptions()
    {
        return ActivityCategory::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);
    }

    private function rules(): array
    {
        return [
            'activity_category_id' => ['required', 'integer', 'exists:activity_categories,id'],
            'title' => ['required', 'string', 'max:150'],
            'summary' => ['nullable', 'string', 'max:2000'],
            'description' => ['required', 'string'],
            'cover_image_path' => ['nullable', 'string', 'max:255'],
            'venue_name' => ['required', 'string', 'max:150'],
            'venue_address' => ['nullable', 'string', 'max:1000'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'registration_opens_at' => ['nullable', 'date'],
            'registration_closes_at' => ['nullable', 'date', 'after_or_equal:registration_opens_at'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'requires_registration' => ['present', 'boolean'],
            'requires_approval' => ['present', 'boolean'],
            'eligibility_notes' => ['nullable', 'string', 'max:2000'],
            'requirements' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', Rule::in(self::STATUSES)],
            'is_featured' => ['present', 'boolean'],
        ];
    }

    private function attributesFrom(array $validated, ?int $ignoreId = null): array
    {
        return [
            'activity_category_id' => $validated['activity_category_id'],
            'title' => trim($validated['title']),
            'slug' => $this->uniqueSlug($validated['title'], $ignoreId),
            'summary' => $this->blankToNull($validated['summary'] ?? null),
            'description' => $validated['description'],
            'cover_image_path' => $this->blankToNull($validated['cover_image_path'] ?? null),
            'venue_name' => trim($validated['venue_name']),
            'venue_address' => $this->blankToNull($validated['venue_address'] ?? null),
            'starts_at' => $validated['starts_at'],
            'ends_at' => $validated['ends_at'],
            'registration_opens_at' => $this->blankToNull($validated['registration_opens_at'] ?? null),
            'registration_closes_at' => $this->blankToNull($validated['registration_closes_at'] ?? null),
            'capacity' => $validated['capacity'] ?? null,
            'requires_registration' => $validated['requires_registration'],
            'requires_approval' => $validated['requires_approval'],
            'eligibility_notes' => $this->blankToNull($validated['eligibility_notes'] ?? null),
            'requirements' => $this->blankToNull($validated['requirements'] ?? null),
            'status' => $validated['status'],
            'is_featured' => $validated['is_featured'],
        ];
    }

    private function blankToNull(?string $value): ?string
    {
        $trimmed = trim((string) $value);

        return $trimmed === '' ? null : $trimmed;
    }

    private function participantRow(ActivityRegistration $registration): array
    {
        $profile = $registration->youthProfile;

        return [
            'id' => $registration->id,
            'youth_profile_id' => $registration->youth_profile_id,
            'full_name' => trim(implode(' ', array_filter([
                $profile?->fname,
                $profile?->mname,
                $profile?->lname,
                $profile?->suffix,
            ]))) ?: 'Unknown youth',
            'email' => $profile?->email,
            'mobile_number' => $profile?->mobile_number,
            'barangay' => $profile?->brgyCode,
            'status' => $registration->status,
            'has_attended' => $registration->attendance !== null,
            'attended_at' => optional($registration->attendance?->attended_at)->toIso8601String(),
            'registered_at' => optional($registration->registered_at)?->toIso8601String(),
            'reviewed_at' => optional($registration->reviewed_at)?->toIso8601String(),
            'rejection_reason' => $registration->rejection_reason,
        ];
    }

    private function messages(): array
    {
        return [
            'activity_category_id.required' => 'Choose a category.',
            'activity_category_id.exists' => 'That category no longer exists.',
            'title.required' => 'Enter a title.',
            'description.required' => 'Enter a description.',
            'status.in' => 'Choose one of draft, published, cancelled, or archived.',
            'status.required' => 'Choose a status.',
            'venue_name.required' => 'Enter a venue name.',
            'starts_at.required' => 'Choose a start date and time.',
            'ends_at.required' => 'Choose an end date and time.',
            'ends_at.after' => 'The end must come after the start.',
            'registration_closes_at.after_or_equal' => 'Registration must close on or after it opens.',
            'capacity.min' => 'Capacity must be at least 1, or leave it empty for unlimited.',
            'requires_registration.present' => 'Choose whether registration is required.',
            'requires_approval.present' => 'Choose whether approval is required.',
            'is_featured.present' => 'Choose whether this activity is featured.',
        ];
    }

    private function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = rtrim(Str::limit(Str::slug($value), 150, ''), '-') ?: 'activity';
        $slug = $base;
        $suffix = 2;

        while (Activity::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = Str::limit("{$base}-{$suffix}", 150, '');
            $suffix++;
        }

        return $slug;
    }
}
