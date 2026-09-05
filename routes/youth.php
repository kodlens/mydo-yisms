<?php

use App\Http\Controllers\Student\AuthController;
use App\Http\Controllers\Student\PendingPageController;
use App\Http\Controllers\Student\StudentDashboardController;
use App\Http\Controllers\Student\StudentMyAccountController;
use App\Http\Controllers\Student\StudentRegistrationController;
use App\Http\Controllers\Student\YouthServiceController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest:youth')->group(function () {
    Route::get('/youth-login', [AuthController::class, 'index'])->name('youth-login.index');
    Route::post('/youth-login', [AuthController::class, 'login'])->name('youth-login.login');

    Route::get('/youth-register', [StudentRegistrationController::class, 'index'])->name('youth-register.index');
    Route::post('/youth-register', [StudentRegistrationController::class, 'store'])->name('youth-register.store');

    Route::get('/student-login', fn () => redirect()->route('youth-login.index'))->name('student-login.index');
    Route::post('/student-login', [AuthController::class, 'login'])->name('student-login.login');
    Route::get('/student-register', fn () => redirect()->route('youth-register.index'))->name('student-register.index');
    Route::post('/student-register', [StudentRegistrationController::class, 'store'])->name('student-register.store');
});

Route::middleware('auth:youth')->group(function () {
    Route::post('youth-logout', [AuthController::class, 'destroy'])->name('youth-logout');
    Route::post('student-logout', [AuthController::class, 'destroy'])->name('student-logout');

    // Route::get('/youth/account-status', [PendingPageController::class, 'index'])->name('youth.pending-page.index');
    // Route::get('/student/account-pending', fn () => redirect()->route('youth.pending-page.index'))->name('student.pending-page.index');

    Route::get('/youth/dashboard', [StudentDashboardController::class, 'index'])
        ->name('youth.dashboard.index');

    Route::get('/student/dashboard', fn () => redirect()->route('youth.dashboard.index'))->name('student.dashboard.index');

    Route::get('/youth/my-account', [StudentMyAccountController::class, 'index'])
        ->name('youth.my-account.index');

    Route::get('/student/my-account', fn () => redirect()->route('youth.my-account.index'))->name('student.my-account.index');

    Route::get('/youth/services', [YouthServiceController::class, 'index'])
        ->name('youth.services.index');

    Route::get('/youth/services/{service}', [YouthServiceController::class, 'show'])
        ->name('youth.services.show');
});
