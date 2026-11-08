<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffScholarshipController extends Controller
{
    /**
     * Display the scholarships management page for staff.
     */
    public function index(): Response
    {
        return Inertia::render('staff/scholarships/staff-scholarships-page');
    }

    /**
     * Get paginated scholarships data with application count.
     */
    public function getData(Request $request): JsonResponse
    {
        $perPage = max(1, min(100, (int) $request->input('perpage', 10)));
        $search = trim((string) $request->input('search', ''));
        $status = (string) $request->input('status', 'all');

        $query = ScholarshipType::query()
            ->withCount('applications')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('scholarship', 'like', "%{$search}%")
                        ->orWhere('target_beneficiary', 'like', "%{$search}%")
                        ->orWhere('benefit', 'like', "%{$search}%");
                });
            })
            ->when($status === 'active', fn ($q) => $q->where('is_active', true))
            ->when($status === 'inactive', fn ($q) => $q->where('is_active', false));

        $data = $query->orderBy('id', 'desc')->paginate($perPage);

        return response()->json($data);
    }

    /**
     * Store a newly created scholarship program.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scholarship' => ['required', 'string', 'max:255', Rule::unique('scholarship_types', 'scholarship')],
            'target_beneficiary' => ['nullable', 'string', 'max:255'],
            'benefit' => ['nullable', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
            'is_active' => ['boolean'],
        ], [
            'scholarship.required' => 'The scholarship program name is required.',
            'scholarship.unique' => 'A scholarship program with this title already exists.',
            'amount.numeric' => 'The grant amount must be a valid number.',
        ]);

        $scholarship = ScholarshipType::create([
            'scholarship' => trim($validated['scholarship']),
            'target_beneficiary' => isset($validated['target_beneficiary']) ? trim($validated['target_beneficiary']) : null,
            'benefit' => isset($validated['benefit']) ? trim($validated['benefit']) : null,
            'amount' => $validated['amount'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Scholarship program created successfully.',
            'data' => $scholarship,
        ], 201);
    }

    /**
     * Update an existing scholarship program.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $scholarship = ScholarshipType::findOrFail($id);

        $validated = $request->validate([
            'scholarship' => ['required', 'string', 'max:255', Rule::unique('scholarship_types', 'scholarship')->ignore($scholarship->id)],
            'target_beneficiary' => ['nullable', 'string', 'max:255'],
            'benefit' => ['nullable', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99'],
            'is_active' => ['boolean'],
        ], [
            'scholarship.required' => 'The scholarship program name is required.',
            'scholarship.unique' => 'A scholarship program with this title already exists.',
            'amount.numeric' => 'The grant amount must be a valid number.',
        ]);

        $scholarship->update([
            'scholarship' => trim($validated['scholarship']),
            'target_beneficiary' => isset($validated['target_beneficiary']) ? trim($validated['target_beneficiary']) : null,
            'benefit' => isset($validated['benefit']) ? trim($validated['benefit']) : null,
            'amount' => $validated['amount'] ?? null,
            'is_active' => $validated['is_active'] ?? $scholarship->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Scholarship program updated successfully.',
            'data' => $scholarship->fresh(),
        ]);
    }

    /**
     * Toggle the active status of a scholarship program.
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $scholarship = ScholarshipType::findOrFail($id);

        $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $scholarship->is_active = (bool) $request->input('is_active');
        $scholarship->save();

        return response()->json([
            'success' => true,
            'message' => $scholarship->is_active
                ? 'Scholarship program is now active and accepting applications.'
                : 'Scholarship program has been deactivated.',
            'is_active' => $scholarship->is_active,
        ]);
    }

    /**
     * Delete a scholarship program (only if no applications exist).
     */
    public function destroy(int $id): JsonResponse
    {
        $scholarship = ScholarshipType::withCount('applications')->findOrFail($id);

        if ($scholarship->applications_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete '{$scholarship->scholarship}' because it has {$scholarship->applications_count} submitted application(s). You can deactivate it instead.",
            ], 422);
        }

        $scholarship->delete();

        return response()->json([
            'success' => true,
            'message' => 'Scholarship program deleted successfully.',
        ]);
    }
}
