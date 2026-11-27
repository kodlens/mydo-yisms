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
            ->where('role', 'sk')
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('username', 'like', "%{$search}%")
                        ->orWhere('lname', 'like', "%{$search}%")
                        ->orWhere('fname', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
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
        ]);

        $skUser = User::create([
            'username' => trim($validated['username']),
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'lname' => trim($validated['lname']),
            'fname' => trim($validated['fname']),
            'mname' => isset($validated['mname']) ? trim($validated['mname']) : null,
            'suffix' => isset($validated['suffix']) ? trim($validated['suffix']) : null,
            'role' => 'sk',
        ]);

        ActivityLogger::log(
            'sk_official.created',
            "Staff registered SK Official account: {$skUser->fname} {$skUser->lname} (@{$skUser->username})",
            $skUser,
            null,
            $skUser->toArray(),
            ['sk_user_id' => $skUser->id]
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
        ];

        if ($req->filled('password')) {
            $rules['password'] = ['required', 'string', 'min:4', 'confirmed'];
        }

        $validated = $req->validate($rules);

        $attributes = [
            'username' => trim($validated['username']),
            'email' => strtolower(trim($validated['email'])),
            'lname' => trim($validated['lname']),
            'fname' => trim($validated['fname']),
            'mname' => isset($validated['mname']) ? trim($validated['mname']) : null,
            'suffix' => isset($validated['suffix']) ? trim($validated['suffix']) : null,
        ];

        if ($req->filled('password')) {
            $attributes['password'] = Hash::make($validated['password']);
        }

        $skUser->update($attributes);

        ActivityLogger::log(
            'sk_official.updated',
            "Staff updated SK Official account: {$skUser->fname} {$skUser->lname} (@{$skUser->username})",
            $skUser,
            $old,
            $skUser->fresh()->toArray(),
            ['sk_user_id' => $skUser->id]
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
}
