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



Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('publisher/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('publisher.dashboard');

    Route::get('encoder/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('encoder.dashboard');

    Route::get('external-encoder/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('external-encoder.dashboard');

    Route::get('admin/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('admin.dashboard');


});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/student.php';
require __DIR__.'/admin.php';
require __DIR__.'/staff.php';
