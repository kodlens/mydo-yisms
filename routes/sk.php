<?php

use App\Http\Controllers\Sk\SkAuthController;
use App\Http\Controllers\Sk\SkDashboardController;
use App\Http\Controllers\Sk\SkEventActivityController;
use App\Http\Controllers\Sk\SkRegistrationController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest:youth')->group(function () {
    Route::get('/sk-login', [SkAuthController::class, 'index'])->name('sk-login.index');
    Route::post('/sk-login', [SkAuthController::class, 'login'])->name('sk-login.login');

    Route::get('/sk-register', [SkRegistrationController::class, 'index'])->name('sk-register.index');
    Route::post('/sk-register', [SkRegistrationController::class, 'store'])->name('sk-register.store');
});

Route::middleware(['auth:youth', 'role:sk'])->group(function () {
    Route::post('/sk-logout', [SkAuthController::class, 'destroy'])->name('sk-logout');

    Route::prefix('sk')->name('sk.')->group(function () {
        Route::get('/dashboard', [SkDashboardController::class, 'index'])->name('dashboard.index');
        Route::get('/events-activities', [SkEventActivityController::class, 'index'])->name('events-activities.index');
        Route::post('/events-activities/{activity}/evidence', [SkEventActivityController::class, 'storeEvidence'])
            ->whereNumber('activity')
            ->name('events-activities.evidence.store');
        Route::delete('/events-activities/{activity}/evidence/{evidence}', [SkEventActivityController::class, 'destroyEvidence'])
            ->whereNumber(['activity', 'evidence'])
            ->name('events-activities.evidence.destroy');
    });
});
