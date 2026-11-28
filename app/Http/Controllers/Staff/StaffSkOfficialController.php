<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class StaffSkOfficialController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('staff/sk-officials/staff-sk-officials-page');
    }

    public function getData(Request $req): JsonResponse
    {
        $perPage = (int) $req->input('perpage', 10);
        $search = trim((string) $req->input('search', ''));

        $query = User::query()
            ->with(['province', 'city', 'barangay'])
            ->where('role', 'sk')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('username', 'like', "%{$search}%")
                        ->orWhere('lname', 'like', "%{$search}%")
                        ->orWhere('fname', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('sk_position', 'like', "%{$search}%")
                        ->orWhereHas('barangay', fn ($b) => $b->where('brgyDesc', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('id');

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $req): JsonResponse
    {
        $validated = $req->validate([
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'email' => ['required', 'email', 'max:100', 'unique:users,email'],
            'password' => ['required', 'string', 'min:4', 'confirmed'],
            'lname' => ['required', 'string', 'max:100'],
            'fname' => ['required', 'string', 'max:100'],
            'mname' => ['nullable', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:30'],
            'sk_position' => ['required', 'string', 'max:100'],
            'provCode' => ['required', 'exists:provinces,provCode'],
            'citymunCode' => ['required', 'exists:cities,citymunCode'],
            'brgyCode' => ['required', 'exists:barangays,brgyCode'],
            'street_address' => ['nullable', 'string', 'max:255'],
        ], $this->messages());

        $skUser = User::create([
            'username' => trim($validated['username']),
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'lname' => trim($validated['lname']),
            'fname' => trim($validated['fname']),
            'mname' => isset($validated['mname']) && trim($validated['mname']) !== '' ? trim($validated['mname']) : null,
            'suffix' => isset($validated['suffix']) && trim($validated['suffix']) !== '' ? trim($validated['suffix']) : null,
            'role' => 'sk',
            'sk_position' => trim($validated['sk_position']),
            'provCode' => (string) $validated['provCode'],
            'citymunCode' => (string) $validated['citymunCode'],
            'brgyCode' => (string) $validated['brgyCode'],
            'street_address' => isset($validated['street_address']) && trim($validated['street_address']) !== '' ? trim($validated['street_address']) : null,
        ]);

        $skUser->load(['barangay', 'city', 'province']);
        $brgyLabel = $skUser->barangay?->brgyDesc ?? $skUser->brgyCode;

        ActivityLogger::log(
            'sk_official.created',
            "Staff registered SK Official account: {$skUser->fname} {$skUser->lname} (@{$skUser->username}) — {$skUser->sk_position}, Brgy. {$brgyLabel}",
            $skUser,
            null,
            $skUser->toArray(),
            ['sk_user_id' => $skUser->id, 'brgyCode' => $skUser->brgyCode, 'sk_position' => $skUser->sk_position]
        );

        return response()->json([
            'status' => 'saved',
            'success' => true,
            'message' => 'SK Official account registered successfully.',
        ]);
    }

    public function update(Request $req, int $id): JsonResponse
    {
        $skUser = User::where('role', 'sk')->findOrFail($id);
        $old = $skUser->toArray();

        $rules = [
            'username' => ['required', 'string', 'max:50', "unique:users,username,{$skUser->id},id"],
            'email' => ['required', 'email', 'max:100', "unique:users,email,{$skUser->id},id"],
            'lname' => ['required', 'string', 'max:100'],
            'fname' => ['required', 'string', 'max:100'],
            'mname' => ['nullable', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:30'],
            'sk_position' => ['required', 'string', 'max:100'],
            'provCode' => ['required', 'exists:provinces,provCode'],
            'citymunCode' => ['required', 'exists:cities,citymunCode'],
            'brgyCode' => ['required', 'exists:barangays,brgyCode'],
            'street_address' => ['nullable', 'string', 'max:255'],
        ];

        if ($req->filled('password')) {
            $rules['password'] = ['required', 'string', 'min:4', 'confirmed'];
        }

        $validated = $req->validate($rules, $this->messages());

        $attributes = [
            'username' => trim($validated['username']),
            'email' => strtolower(trim($validated['email'])),
            'lname' => trim($validated['lname']),
            'fname' => trim($validated['fname']),
            'mname' => isset($validated['mname']) && trim($validated['mname']) !== '' ? trim($validated['mname']) : null,
            'suffix' => isset($validated['suffix']) && trim($validated['suffix']) !== '' ? trim($validated['suffix']) : null,
            'sk_position' => trim($validated['sk_position']),
            'provCode' => (string) $validated['provCode'],
            'citymunCode' => (string) $validated['citymunCode'],
            'brgyCode' => (string) $validated['brgyCode'],
            'street_address' => isset($validated['street_address']) && trim($validated['street_address']) !== '' ? trim($validated['street_address']) : null,
        ];

        if ($req->filled('password')) {
            $attributes['password'] = Hash::make($validated['password']);
        }

        $skUser->update($attributes);
        $skUser->load(['barangay', 'city', 'province']);
        $brgyLabel = $skUser->barangay?->brgyDesc ?? $skUser->brgyCode;

        ActivityLogger::log(
            'sk_official.updated',
            "Staff updated SK Official account: {$skUser->fname} {$skUser->lname} (@{$skUser->username}) — {$skUser->sk_position}, Brgy. {$brgyLabel}",
            $skUser,
            $old,
            $skUser->toArray(),
            ['sk_user_id' => $skUser->id, 'brgyCode' => $skUser->brgyCode, 'sk_position' => $skUser->sk_position]
        );

        return response()->json([
            'status' => 'updated',
            'success' => true,
            'message' => 'SK Official account updated successfully.',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $skUser = User::where('role', 'sk')->findOrFail($id);
        $old = $skUser->toArray();

        $skUser->delete();

        ActivityLogger::log(
            'sk_official.deleted',
            "Staff deleted SK Official account: {$old['fname']} {$old['lname']} (@{$old['username']})",
            null,
            $old,
            null,
            ['sk_user_id' => $id]
        );

        return response()->json([
            'status' => 'deleted',
            'success' => true,
            'message' => 'SK Official account removed successfully.',
        ]);
    }

    private function messages(): array
    {
        return [
            'sk_position.required' => 'Please select the SK position.',
            'provCode.required' => 'Province is required.',
            'citymunCode.required' => 'City / Municipality is required.',
            'brgyCode.required' => 'Assigned barangay is required.',
        ];
    }
}
