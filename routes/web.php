<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Student\AuthController;
use App\Http\Controllers\Student\StudentRegistrationController;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

//open route
Route::get('/load-provinces', [App\Http\Controllers\OpenController::class, 'loadProvinces']);
Route::get('/load-cities', [App\Http\Controllers\OpenController::class, 'loadCities']);
Route::get('/load-barangays', [App\Http\Controllers\OpenController::class, 'loadBarangays']);



Route::middleware('guest')->group(function () {
    Route::get('/student-login', [AuthController::class, 'index'])->name('student-login');
    Route::get('/student-register', [StudentRegistrationController::class, 'index'])->name('student-register');
    Route::post('/student-register', [StudentRegistrationController::class, 'store'])->name('student-register.store');
});

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
