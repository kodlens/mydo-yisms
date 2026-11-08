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
        $validate = $req->validate([
            'search' => [ 'string', 'nullable'],
        ]);

        return User::where('username', 'like', $req->search . '%')
            ->orWhere('lname', 'like', $req->search . '%')
            ->orWhere('fname', 'like', $req->search . '%')
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
        return User::find($id);
    }


    public function store(Request $req){
        $req->validate([
            'username' => ['required', 'string', 'unique:users'],
            'lname' => ['required', 'string'],
            'fname' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:users'],
            'password' => ['required', 'string', 'confirmed'],
            //'sex' => ['required', 'string'],
            'role' => ['required', 'string'],
        ]);

        User::create([
            'username' => $req->username,
            'password' => Hash::make($req->password),
            'lname' => $req->lname,
            'fname' => $req->fname,
            'mname' => $req->mname,
            'email' => $req->email,
            'role' => $req->role,
        ]);

        return response()->json([
            'status' => 'saved'
        ], 200);
    }

    public function update(Request $req, $id){
        //return $req;
        $req->validate([
            'username' => ['required', 'string', 'unique:users,username,'. $id . ',id'],
            'lname' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:users,email,'. $id . ',id'],
            //'sex' => ['required', 'string'],
            'role' => ['required', 'string'],
        ]);

        User::where('id', $id)
            ->update([
                'username' => $req->username,
                'lname' => $req->lname,
                'fname' => $req->fname,
                'mname' => $req->mname,
                'email' => $req->email,
                'role' => $req->role,
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
