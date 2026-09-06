<?php

use App\Http\Controllers\Staff\StaffApplicantController;
use App\Http\Controllers\Staff\StaffYouthProfileController;
use App\Http\Controllers\Staff\StaffDashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:staff'])->prefix('staff')->name('staff.')->group(function () {

    Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('dashboard.index');

    Route::resource('/youth-profiles', StaffYouthProfileController::class)->names('youth-profiles');
    Route::get('/get-youth-profiles', [StaffYouthProfileController::class, 'getData'])->name('youth-profiles.get-data');


    Route::patch('/applicants/{applicant}/status', [StaffApplicantController::class, 'updateStatus'])->name('applicants.status.update');
    Route::resource('/applicants', StaffApplicantController::class)->only(['index', 'show'])->names('scholarship-applicants');
    Route::get('/get-applicants', [StaffApplicantController::class, 'getData'])->name('scholarship-applicants.get-data');
});
