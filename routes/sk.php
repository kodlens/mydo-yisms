<?php

use App\Http\Controllers\Sk\SkDashboardController;
use App\Http\Controllers\Sk\SkEventActivityController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:sk'])->prefix('sk')->name('sk.')->group(function () {
    Route::get('/dashboard', [SkDashboardController::class, 'index'])->name('dashboard.index');
    Route::get('/events-activities', [SkEventActivityController::class, 'index'])->name('events-activities.index');
    Route::post('/events-activities/{activity}/evidence', [SkEventActivityController::class, 'storeEvidence'])
        ->whereNumber('activity')
        ->name('events-activities.evidence.store');
    Route::delete('/events-activities/{activity}/evidence/{evidence}', [SkEventActivityController::class, 'destroyEvidence'])
        ->whereNumber(['activity', 'evidence'])
        ->name('events-activities.evidence.destroy');
});

