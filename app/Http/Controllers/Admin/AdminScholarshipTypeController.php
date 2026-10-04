<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
#ETIENNE WAYNE

class AdminScholarshipTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/scholarship-types/admin-scholarship-types-page');
    }

    public function getData(Request $req)
    {
        // Clamp the page size so a hand-crafted request cannot pull the whole table.
        $perPage = max(1, min(100, (int) $req->input('perpage', 10)));
        $search = trim((string) $req->input('search', ''));
        $status = (string) $req->input('status', '');

        $data = ScholarshipType::withCount('applications')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('scholarship', 'like', "%{$search}%")
                        ->orWhere('target_beneficiary', 'like', "%{$search}%")
                        ->orWhere('benefit', 'like', "%{$search}%");
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
            'scholarship' => ['required', 'string', 'max:255', Rule::unique('scholarship_types', 'scholarship')],
            'target_beneficiary' => ['nullable', 'string', 'max:255'],
            'benefit' => ['nullable', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99', 'decimal:0,2'],
            'is_active' => ['present', 'boolean'],
        ], $this->messages());

        $scholarshipType = ScholarshipType::create([
            'scholarship' => $validated['scholarship'],
            'target_beneficiary' => $validated['target_beneficiary'] ?? null,
            'benefit' => $validated['benefit'] ?? null,
            'amount' => $validated['amount'] ?? null,
            'is_active' => $validated['is_active'],
        ]);

        return response()->json([
            'message' => 'Scholarship type created successfully.',
            'success' => true,
            'data' => $scholarshipType,
        ], 201);
    }

    public function update(Request $req, $id)
    {
        $scholarshipType = ScholarshipType::findOrFail($id);

        $validated = $req->validate([
            'scholarship' => ['required', 'string', 'max:255', Rule::unique('scholarship_types', 'scholarship')->ignore($scholarshipType->id)],
            'target_beneficiary' => ['nullable', 'string', 'max:255'],
            'benefit' => ['nullable', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric', 'min:0', 'max:9999999999.99', 'decimal:0,2'],
            'is_active' => ['present', 'boolean'],
        ], $this->messages());

        $scholarshipType->update([
            'scholarship' => $validated['scholarship'],
            'target_beneficiary' => $validated['target_beneficiary'] ?? null,
            'benefit' => $validated['benefit'] ?? null,
            'amount' => $validated['amount'] ?? null,
            'is_active' => $validated['is_active'],
        ]);

        return response()->json([
            'message' => 'Scholarship type updated successfully.',
            'success' => true,
            'data' => $scholarshipType->fresh(),
        ], 200);
    }

    public function setActive(Request $req, $id)
    {
        $validated = $req->validate([
            'is_active' => ['present', 'boolean'],
        ], $this->messages());

        $scholarshipType = ScholarshipType::findOrFail($id);
        $scholarshipType->is_active = $validated['is_active'];
        $scholarshipType->save();

        return response()->json([
            'message' => 'Scholarship type set to ' . ($scholarshipType->is_active ? 'active' : 'inactive') . '.',
            'success' => true,
            'data' => $scholarshipType,
        ], 200);
    }

    public function destroy($id)
    {
        $scholarshipType = ScholarshipType::withCount('applications')->findOrFail($id);

        // Applications cascade on delete, so removing the type would erase applicant records.
        if ($scholarshipType->applications_count > 0) {
            $label = $scholarshipType->applications_count === 1 ? 'application still uses' : 'applications still use';

            return response()->json([
                'message' => "{$scholarshipType->applications_count} {$label} this scholarship type. Set it to inactive instead of deleting it.",
                'success' => false,
            ], 422);
        }

        $scholarshipType->delete();

        return response()->json([
            'message' => 'Scholarship type successfully deleted.',
            'success' => true,
        ], 200);
    }

    /**
     * Validation messages that read naturally in the admin UI.
     */
    private function messages(): array
    {
        return [
            'scholarship.required' => 'Enter a scholarship or program name.',
            'scholarship.unique' => 'A scholarship type with that name already exists.',
            'amount.min' => 'The amount cannot be negative.',
            'amount.max' => 'The amount is too large.',
            'amount.decimal' => 'Enter the amount with at most 2 decimal places.',
            'is_active.present' => 'Choose whether this scholarship type is open or not.',
            'is_active.boolean' => 'The open status must be true or false.',
        ];
    }
}
