<?php

namespace App\Http\Controllers\Sk;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sk\StoreSkRegistrationRequest;
use App\Models\YouthProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SkRegistrationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('auth/sk/sk-register-page', [
            'xToken' => csrf_token(),
        ]);
    }

    public function store(StoreSkRegistrationRequest $req)
    {
        $validated = $req->validated();
        $filename = basename((string) data_get($req->input('school_id'), '0.response.filename'));

        unset($validated['school_id']);

        DB::transaction(function () use ($validated, $filename) {
            $sk = YouthProfile::create([
                ...$validated,
                'password' => Hash::make($validated['password']),
                'role' => 'sk',
                'status' => 'pending',
                'is_active' => false,
            ]);

            $disk = Storage::disk('public');
            $firstName = $sk->fname ?? 'X';
            $lastName = $sk->lname ?? 'X';
            $slug = strtoupper(Str::slug(mb_substr($firstName, 0, 1) . $lastName, ''));
            $directory = "upfiles/sk-profiles/{$sk->id}_{$slug}";
            $destination = "{$directory}/sk_id_{$filename}";

            $disk->makeDirectory($directory);
            $moved = $disk->move("temp/{$filename}", $destination);

            if (! $moved) {
                throw new \RuntimeException('Failed to store uploaded SK Official ID image.');
            }

            $sk->update([
                'school_id_path' => $destination,
            ]);
        });

        return response()->json([
            'success' => true,
        ], 200);
    }
}
