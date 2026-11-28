<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(){
        return Inertia::render('admin/users/admin-users-page');
    }

    public function getData(Request $req){
        $req->validate([
            'search' => ['string', 'nullable'],
        ]);

        $search = trim((string) $req->input('search', ''));

        return User::with(['province', 'city', 'barangay'])
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
            ->orderBy('id', 'desc')
            ->paginate($req->perpage);
    }

    public function loadPublisherUsers(Request $req){
        return User::orderBy('lname', 'asc')
            ->where('role', 'publisher')
            ->get();
    }

    public function loadEncoderUsers(Request $req){
        return User::orderBy('lname', 'asc')
            ->where('role', 'encoder')
            ->orWhere('role', 'ee')
            ->get();
    }

    public function show($id){
        return User::with(['province', 'city', 'barangay'])->find($id);
    }


    public function store(Request $req){
        $isSk = $req->input('role') === 'sk';

        $validated = $req->validate([
            'username' => ['required', 'string', 'unique:users'],
            'lname' => ['required', 'string'],
            'fname' => ['required', 'string'],
            'mname' => ['nullable', 'string'],
            'email' => ['required', 'email', 'unique:users'],
            'password' => ['required', 'string', 'confirmed'],
            'role' => ['required', 'string'],
            'sk_position' => [\Illuminate\Validation\Rule::requiredIf($isSk), 'nullable', 'string', 'max:100'],
            'provCode' => [\Illuminate\Validation\Rule::requiredIf($isSk), 'nullable', 'exists:provinces,provCode'],
            'citymunCode' => [\Illuminate\Validation\Rule::requiredIf($isSk), 'nullable', 'exists:cities,citymunCode'],
            'brgyCode' => [\Illuminate\Validation\Rule::requiredIf($isSk), 'nullable', 'exists:barangays,brgyCode'],
            'street_address' => ['nullable', 'string', 'max:255'],
        ], [
            'sk_position.required' => 'Please select the SK position.',
            'provCode.required' => 'Province is required for SK Officials.',
            'citymunCode.required' => 'City / Municipality is required for SK Officials.',
            'brgyCode.required' => 'Assigned barangay is required for SK Officials.',
        ]);

        User::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'lname' => $validated['lname'],
            'fname' => $validated['fname'],
            'mname' => $validated['mname'] ?? null,
            'email' => $validated['email'],
            'role' => $validated['role'],
            'sk_position' => $isSk ? ($validated['sk_position'] ?? null) : null,
            'provCode' => $isSk && isset($validated['provCode']) ? (string) $validated['provCode'] : null,
            'citymunCode' => $isSk && isset($validated['citymunCode']) ? (string) $validated['citymunCode'] : null,
            'brgyCode' => $isSk && isset($validated['brgyCode']) ? (string) $validated['brgyCode'] : null,
            'street_address' => $isSk && !empty($validated['street_address']) ? trim($validated['street_address']) : null,
        ]);

        return response()->json([
            'status' => 'saved'
        ], 200);
    }

    public function update(Request $req, $id){
        $isSk = $req->input('role') === 'sk';

        $validated = $req->validate([
            'username' => ['required', 'string', 'unique:users,username,'. $id . ',id'],
            'lname' => ['required', 'string'],
            'fname' => ['required', 'string'],
            'mname' => ['nullable', 'string'],
            'email' => ['required', 'email', 'unique:users,email,'. $id . ',id'],
            'role' => ['required', 'string'],
            'sk_position' => [\Illuminate\Validation\Rule::requiredIf($isSk), 'nullable', 'string', 'max:100'],
            'provCode' => [\Illuminate\Validation\Rule::requiredIf($isSk), 'nullable', 'exists:provinces,provCode'],
            'citymunCode' => [\Illuminate\Validation\Rule::requiredIf($isSk), 'nullable', 'exists:cities,citymunCode'],
            'brgyCode' => [\Illuminate\Validation\Rule::requiredIf($isSk), 'nullable', 'exists:barangays,brgyCode'],
            'street_address' => ['nullable', 'string', 'max:255'],
        ], [
            'sk_position.required' => 'Please select the SK position.',
            'provCode.required' => 'Province is required for SK Officials.',
            'citymunCode.required' => 'City / Municipality is required for SK Officials.',
            'brgyCode.required' => 'Assigned barangay is required for SK Officials.',
        ]);

        User::where('id', $id)
            ->update([
                'username' => $validated['username'],
                'lname' => $validated['lname'],
                'fname' => $validated['fname'],
                'mname' => $validated['mname'] ?? null,
                'email' => $validated['email'],
                'role' => $validated['role'],
                'sk_position' => $isSk ? ($validated['sk_position'] ?? null) : null,
                'provCode' => $isSk && isset($validated['provCode']) ? (string) $validated['provCode'] : null,
                'citymunCode' => $isSk && isset($validated['citymunCode']) ? (string) $validated['citymunCode'] : null,
                'brgyCode' => $isSk && isset($validated['brgyCode']) ? (string) $validated['brgyCode'] : null,
                'street_address' => $isSk && !empty($validated['street_address']) ? trim($validated['street_address']) : null,
            ]);

        return response()->json([
            'status' => 'updated'
        ], 200);
    }

    public function destroy($id){
        User::destroy($id);

        return response()->json([
            'status' => 'deleted'
        ], 200);
    }


    public function changePassword(Request $req, $id){

        if(!Auth::check()){
            return response()->json([
                'errors' => [
                    'password' => ['Forbidden. You are not logged in.']
                ]
            ], 422);
        }

        $req->validate([
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $data = User::findOrFail($id);
        $data->password = Hash::make($req->password);
        $data->save();

        ActivityLogger::log(
            'password_change',
            "Changed password for user: {$data->fname} {$data->lname} ({$data->email}, role: {$data->role})",
            $data,
            null,
            null,
            ['target_user_id' => $data->id, 'target_role' => $data->role]
        );

        return response()->json([
            'status' => 'changed',
            'message' => 'Password changed successfully.',
        ], 200);
    }
}
