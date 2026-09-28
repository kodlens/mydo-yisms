<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminActivityCategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/activity-categories/admin-activity-categories-page');
    }

    public function getData(Request $req)
    {
        $perPage = (int) $req->input('perpage', 10);
        $search = trim((string) $req->input('search', ''));
        $status = (string) $req->input('status', '');

        $data = ActivityCategory::when($search !== '', function ($q) use ($search) {
            $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        })
            ->when(in_array($status, ['active', 'inactive'], true), fn ($q) => $q->where('is_active', $status === 'active' ? 1 : 0))
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return $data;
    }

    public function store(Request $req)
    {
        $validated = $req->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('activity_categories', 'name')],
            'slug' => ['nullable', 'string', 'max:100', Rule::unique('activity_categories', 'slug')],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['present', 'boolean'],
        ], $this->messages());

        $category = ActivityCategory::create([
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug(($validated['slug'] ?? '') ?: $validated['name']),
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'],
        ]);

        return response()->json([
            'message' => 'Activity category created successfully.',
            'success' => true,
            'data' => $category,
        ], 201);
    }

    public function update(Request $req, $id)
    {
        $category = ActivityCategory::findOrFail($id);

        $validated = $req->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('activity_categories', 'name')->ignore($category->id)],
            'slug' => ['nullable', 'string', 'max:100', Rule::unique('activity_categories', 'slug')->ignore($category->id)],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['present', 'boolean'],
        ], $this->messages());

        $category->update([
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug(($validated['slug'] ?? '') ?: $validated['name'], $category->id),
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'],
        ]);

        return response()->json([
            'message' => 'Activity category updated successfully.',
            'success' => true,
            'data' => $category->fresh(),
        ], 200);
    }

    public function setActive(Request $req, $id)
    {
        $validated = $req->validate([
            'is_active' => ['present', 'boolean'],
        ], $this->messages());

        $category = ActivityCategory::findOrFail($id);
        $category->is_active = $validated['is_active'];
        $category->save();

        return response()->json([
            'message' => 'Activity category set to ' . ($category->is_active ? 'active' : 'inactive') . '.',
            'success' => true,
            'data' => $category,
        ], 200);
    }

    public function destroy($id)
    {
        $category = ActivityCategory::withCount('activities')->findOrFail($id);

        // Activities restrict the delete at the database level, so stop it with a clear message.
        if ($category->activities_count > 0) {
            $label = $category->activities_count === 1 ? 'activity still uses' : 'activities still use';

            return response()->json([
                'message' => "{$category->activities_count} {$label} this category. Set it to inactive instead of deleting it.",
                'success' => false,
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Activity category successfully deleted.',
            'success' => true,
        ], 200);
    }

    /**
     * Validation messages that read naturally in the admin UI.
     */
    private function messages(): array
    {
        return [
            'name.required' => 'Enter a category name.',
            'slug.unique' => 'That slug is already used by another category.',
            'is_active.present' => 'Choose whether this category is active or not.',
            'is_active.boolean' => 'The active status must be true or false.',
        ];
    }

    /**
     * Build a unique slug from the given value, appending a counter when it is taken.
     */
    private function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = rtrim(Str::limit(Str::slug($value), 100, ''), '-') ?: 'category';
        $slug = $base;
        $suffix = 2;

        while (ActivityCategory::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = Str::limit("{$base}-{$suffix}", 100, '');
            $suffix++;
        }

        return $slug;
    }
}
