<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

//open route
Route::get('/load-provinces', [App\Http\Controllers\OpenController::class, 'loadProvinces']);
Route::get('/load-cities', [App\Http\Controllers\OpenController::class, 'loadCities']);
Route::get('/load-barangays', [App\Http\Controllers\OpenController::class, 'loadBarangays']);


Route::post('/temp-upload', [App\Http\Controllers\Base\UploadFileController::class, 'tempUpload'])->name('open.temp-upload');
Route::post('/temp-remove/{filename}', [App\Http\Controllers\Base\UploadFileController::class, 'tempRemove'])->name('open.temp-remove');




require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/youth.php';
require __DIR__.'/admin.php';
require __DIR__.'/staff.php';
