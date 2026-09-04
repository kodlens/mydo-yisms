<?php

use App\Http\Controllers\Staff\StaffApplicantController;
use App\Http\Controllers\Staff\StaffDashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:staff'])->prefix('staff')->name('staff.')->group(function () {
    Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('dashboard.index');

    Route::resource('/applicants', StaffApplicantController::class)->only(['index', 'show'])->names('applicants');
    Route::get('/get-applicants', [StaffApplicantController::class, 'getData'])->name('applicants.get-data');
});
