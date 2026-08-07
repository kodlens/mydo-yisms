<?php

namespace App\Http\Controllers\Base;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadFileController extends Controller
{

    /** IMAGE HANDLING */
    /* ================= */
    public function tempUpload(Request $req){

        $req->validate([
            'upload' => ['required', 'mimes:jpg,jpeg,png,pdf', 'max:5120']
        ],[
            'upload.max' => 'The upload field must not be greater than 5MB in size.'
        ]);

        $file = $req->upload;
        $imagePath = $file->store('temp', 'public');
        $n = explode('/', $imagePath);

        if(isset($n[1])) {
            return response()->json([
                'status' => 'success',
                'filename' => $n[1],
                'path' => $imagePath
            ], 200);
        }

        return response()->json([
            'errors' => [
                'upload' => ['Image upload failed.']
            ],
            'message' => 'Image upload failed.'
        ], 422);
    }

    public function tempRemove($fileName){
        try {
            if(Storage::disk('public')->exists('temp/' .$fileName)) {
                Storage::disk('public')->delete('temp/' . $fileName);
                return response()->json([
                    'status' => 'temp_deleted'
                ], 200);
            }
        }catch(\Exception $e) {
             return response()->json([
                'status' => 'temp_error',
                'message' => $e
            ], 500);
        }

    }

}
