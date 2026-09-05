<?php

use App\Http\Controllers\Youth\YouthAuthController;
use App\Http\Controllers\Youth\PendingPageController;
use App\Http\Controllers\Youth\YouthDashboardController;
use App\Http\Controllers\Youth\YouthMyAccountController;
use App\Http\Controllers\Youth\YouthRegistrationController;
use App\Http\Controllers\Youth\YouthServiceController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest:youth')->group(function () {

    Route::get('/youth-login', [YouthAuthController::class, 'index'])->name('youth-login.index');
    Route::post('/youth-login', [YouthAuthController::class, 'login'])->name('youth-login.login');

    Route::get('/youth-register', [YouthRegistrationController::class, 'index'])->name('youth-register.index');
    Route::post('/youth-register', [YouthRegistrationController::class, 'store'])->name('youth-register.store');

   // Route::get('/youth-login', fn () => redirect()->route('youth-login.index'))->name('student-login.index');
    Route::post('/youth-login', [YouthAuthController::class, 'login'])->name('youth-login.login');
    //Route::get('/youth-register', fn () => redirect()->route('youth-register.index'))->name('youth-register.index');
    Route::post('/youth-register', [YouthRegistrationController::class, 'store'])->name('youth-register.store');
});

Route::middleware('auth:youth')->group(function () {
    Route::post('youth-logout', [AuthController::class, 'destroy'])->name('youth-logout');
    Route::post('student-logout', [AuthController::class, 'destroy'])->name('student-logout');

    // Route::get('/youth/account-status', [PendingPageController::class, 'index'])->name('youth.pending-page.index');
    // Route::get('/student/account-pending', fn () => redirect()->route('youth.pending-page.index'))->name('student.pending-page.index');

    Route::get('/youth/dashboard', [YouthDashboardController::class, 'index'])->name('youth.youth-dashboard.index');

    Route::get('/youth/my-account', [StudentMyAccountController::class, 'index'])->name('youth.my-account.index');

    Route::get('/youth/services', [YouthServiceController::class, 'index'])->name('youth.youth-services.index');
    Route::get('/youth/services/{service}', [YouthServiceController::class, 'show'])->name('youth.youth-services.show');
});
