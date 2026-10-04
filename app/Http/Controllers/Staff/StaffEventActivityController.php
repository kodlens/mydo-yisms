<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityCategory;
use App\Models\ActivityRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffEventActivityController extends Controller
{
    /** The statuses an activity is allowed to be saved as. */
    private const STATUSES = ['draft', 'published', 'cancelled', 'archived'];

    public function index(): Response
    {
        return Inertia::render('staff/events-activities/staff-events-activities-page');
    }

    public function data(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('perpage', 10);
        $search = trim((string) $request->input('search', ''));
        $status = trim((string) $request->input('status', ''));

        $query = Activity::query()
            ->with('category:id,name,slug,is_active')
            // Sign-up counts drive the capacity column, the review queue badge, and the
            // "archive instead of delete" warning in the UI.
            ->withCount([
                'registrations',
                'registrations as approved_registrations_count' => fn ($q) => $q->reservingSlot(),
                'registrations as pending_registrations_count' => fn ($q) => $q->where('status', 'pending'),
                'volunteerAssignments',
            ]);

        // Search matches the title or the slug so staff can find a row either way.
        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // An empty status means "all statuses"; anything else must be one of the known values.
        if (in_array($status, self::STATUSES, true)) {
            $query->where('status', $status);
        }

        // Soonest first, so the next events stay at the top of the list.
        $query->orderBy('starts_at');

        return response()->json($query->paginate($perPage));
    }

    /**
     * Active categories for the "category" dropdown in the create/edit form.
     * A flat list is enough here, so it is not paginated.
     */
    public function categories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->categoryOptions(),
        ]);
    }

    /**
     * The sign-up list for one activity. The activity details are an Inertia prop so the
     * header renders immediately; the participant rows are fetched separately because they
     * change whenever staff approve or reject someone.
     */
    public function participantsPage(int $id): Response
    {
        $activity = Activity::findOrFail($id);

        return Inertia::render('staff/events-activities/staff-activity-participants-page', [
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

    /**
     * The standalone create/edit form. Props are passed as Inertia props instead of
     * fetched with axios, so the form renders with its values already in place.
     */
    public function create(): Response
    {
        return Inertia::render('staff/events-activities/staff-create-edit-events-activities', [
            'activity' => null,
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function edit(int $id): Response
    {
        $activity = Activity::with('category:id,name,slug,is_active')->findOrFail($id);

        return Inertia::render('staff/events-activities/staff-create-edit-events-activities', [
            'activity' => $activity,
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules(), $this->messages());

        $activity = Activity::create([
            ...$this->attributesFrom($validated),
            'created_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Event/activity created successfully.',
            'success' => true,
            'data' => $activity->load('category:id,name,slug,is_active'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        $validated = $request->validate($this->rules(), $this->messages());

        $attributes = $this->attributesFrom($validated, $activity->id);

        // Stamp the publish time the first time an activity goes live, and keep it afterwards.
        if ($attributes['status'] === 'published' && $activity->published_at === null) {
            $attributes['published_at'] = now();
        }

        $activity->update($attributes);

        return response()->json([
            'message' => 'Event/activity updated successfully.',
            'success' => true,
            'data' => $activity->fresh('category:id,name,slug,is_active'),
        ]);
    }

    /**
     * Everyone who signed up for one activity, newest first. Filtered by the
     * `status` query param so the UI can show "Needs review" separately from history.
     */
    public function participants(Request $request, int $id): JsonResponse
    {
        $activity = Activity::findOrFail($id);
        $status = trim((string) $request->input('status', ''));

        $query = $activity->registrations()->with('youthProfile');

        // '' means every status; anything else must be one of the four known values.
        if (in_array($status, ['pending', 'approved', 'rejected', 'cancelled'], true)) {
            $query->where('status', $status);
        }

        // Pending first, then approved, so the review queue floats to the top.
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

    /**
     * Approve or reject one sign-up. Approving is refused when the activity is full,
     * so the last slot cannot be given away twice.
     */
    public function updateParticipant(Request $request, int $id, int $registration): JsonResponse
    {
        $activity = Activity::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'rejection_reason' => ['nullable', 'string', 'max:500'],
        ], $this->messages());

        $registration = $activity->registrations()->whereKey($registration)->firstOrFail();

        if ($validated['status'] === 'approved') {
            // Count everyone else holding a slot, so this registration is not double-counted.
            $others = $activity->registrations()
                ->reservingSlot()
                ->whereKeyNot($registration->id)
                ->count();

            if ($activity->capacity !== null && $others >= $activity->capacity) {
                return response()->json([
                    'message' => 'This activity is already at capacity. Raise the capacity or reject a sign-up first.',
                    'success' => false,
                ], 422);
            }
        }

        // A rejected sign-up needs a reason the youth can act on, so require one.
        $reason = trim((string) ($validated['rejection_reason'] ?? ''));

        if ($validated['status'] === 'rejected' && $reason === '') {
            return response()->json([
                'message' => 'Give a reason so the youth knows why they were not accepted.',
                'success' => false,
            ], 422);
        }

        $registration->update([
            'status' => $validated['status'],
            'reviewed_by' => $request->user()?->id,
            'reviewed_at' => now(),
            'rejection_reason' => $validated['status'] === 'rejected' ? $reason : null,
        ]);

        return response()->json([
            'message' => $validated['status'] === 'approved' ? 'Sign-up approved.' : 'Sign-up rejected.',
            'success' => true,
            'data' => $this->participantRow($registration->refresh()->load('youthProfile')),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $activity = Activity::withCount([
            'registrations',
            'registrations as reserved_registrations_count' => fn ($q) => $q->reservingSlot(),
            'volunteerAssignments',
        ])->findOrFail($id);

        // Youth sign-ups and volunteer records must outlive the activity row, so block the delete.
        if ($activity->reserved_registrations_count > 0) {
            return response()->json([
                'message' => "{$activity->reserved_registrations_count} youth registration(s) still point to this activity. Archive it instead of deleting it.",
                'success' => false,
            ], 422);
        }

        if ($activity->volunteer_assignments_count > 0) {
            return response()->json([
                'message' => "{$activity->volunteer_assignments_count} volunteer assignment(s) still point to this activity. Archive it instead of deleting it.",
                'success' => false,
            ], 422);
        }

        // Everything left is cancelled or rejected history with nothing reserved.
        $activity->registrations()->delete();
        $activity->delete();

        return response()->json([
            'message' => 'Event/activity successfully deleted.',
            'success' => true,
        ]);
    }

    /**
     * Active categories for the "category" dropdown. A flat list is enough for a
     * dropdown, so it is not paginated.
     */
    private function categoryOptions()
    {
        return ActivityCategory::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);
    }

    /**
     * Validation rules shared by store and update. There is no `slug` rule on purpose:
     * the slug is derived from the title on the server, so the client cannot influence it.
     */
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

    /**
     * Turn validated input into model attributes: trim strings, normalise empty
     * text to null, and build a unique slug when none was supplied.
     */
    private function attributesFrom(array $validated, ?int $ignoreId = null): array
    {
        return [
            'activity_category_id' => $validated['activity_category_id'],
            'title' => trim($validated['title']),
            // Always derived from the title, never taken from the request body.
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

    /**
     * Shape one sign-up row for the participants table. Only the profile fields the
     * staff list actually shows are selected, to keep the payload small.
     */
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
            'registered_at' => optional($registration->registered_at)?->toIso8601String(),
            'reviewed_at' => optional($registration->reviewed_at)?->toIso8601String(),
            'rejection_reason' => $registration->rejection_reason,
        ];
    }

    /**
     * Validation messages that read naturally in the staff UI.
     */
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

    /**
     * Build a unique slug from the given value, appending a counter when it is taken.
     */
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
