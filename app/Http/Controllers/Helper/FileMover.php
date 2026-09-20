<?php

namespace App\Http\Controllers\Helper;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class FileMover {

    private $disk = 'public';
    private $userGuard = 'youth';

    public function moveFile($fileName){

        $user = Auth::guard($this->userGuard)
            ->user();

        $sanitizedFilename = basename($fileName);

        $id = $user->id ?? 0;
        $fname = strtoupper($user->fname) ?? 'X';
        $lname = strtoupper($user->lname) ?? 'X';

        $userFolderName =$id . '_'. $fname[0] . $lname;


        if (Storage::disk($this->disk)->exists('temp/' . $sanitizedFilename)) {
            // File exists
            Storage::disk($this->disk)->move(
                'temp/' . $sanitizedFilename,
                'upfiles/' . $sanitizedFilename
            );
            return [
                'move' => true,
                'filename' => $sanitizedFilename
            ];
        }

        return [
            'move' => false,
            'filename' => null
        ];

    }
}
