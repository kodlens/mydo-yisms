<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Youth\StoreYouthRegistrationRequest;
use App\Models\YouthProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class YouthRegistrationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('auth/youth/youth-register-page', [
            'xToken' => csrf_token(),
        ]);
    }

    public function store(StoreYouthRegistrationRequest $req)
    {
        $validated = $req->validated();
        $filename = basename((string) data_get($req->input('school_id'), '0.response.filename'));

        unset($validated['school_id']);

        DB::transaction(function () use ($validated, $filename) {
            $youth = YouthProfile::create([
                ...$validated,
                'password' => Hash::make($validated['password']),
                'role' => 'youth',
                'status' => 'pending',
                'is_active' => false,
            ]);

            $disk = Storage::disk('public');
            $firstName = $youth->fname ?? 'X';
            $lastName = $youth->lname ?? 'X';
            $slug = strtoupper(Str::slug(mb_substr($firstName, 0, 1) . $lastName, ''));
            $directory = "upfiles/youth-profiles/{$youth->id}_{$slug}";
            $destination = "{$directory}/school_id_{$filename}";

            $disk->makeDirectory($directory);
            $moved = $disk->move("temp/{$filename}", $destination);

            if (! $moved) {
                throw new \RuntimeException('Failed to store uploaded School ID image.');
            }

            $youth->update([
                'school_id_path' => $destination,
            ]);
        });

        return response()->json([
            'success' => true,
        ], 200);
    }
}
