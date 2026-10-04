<?php

use App\Http\Controllers\Staff\StaffApplicantController;
use App\Http\Controllers\Staff\StaffVolunteerController;
use App\Http\Controllers\Staff\StaffYouthProfileController;
use App\Http\Controllers\Staff\StaffDashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:staff'])->prefix('staff')->name('staff.')->group(function () {

    Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('dashboard.index');

    Route::resource('/youth-profiles', StaffYouthProfileController::class)->names('youth-profiles');
    Route::get('/get-youth-profiles', [StaffYouthProfileController::class, 'getData'])->name('youth-profiles.get-data');


    Route::patch('/applicants/{applicant}/status', [StaffApplicantController::class, 'updateStatus'])->name('applicants.status.update');
    Route::resource('/applicants', StaffApplicantController::class)->names('scholarship-applicants');
    Route::get('/get-applicants', [StaffApplicantController::class, 'getData'])->name('scholarship-applicants.get-data');

    // Volunteer programme. No resource route here: staff cannot register or delete a
    // volunteer, so only the review, assignment, and attendance actions are exposed.
    Route::get('/volunteers', [StaffVolunteerController::class, 'index'])->name('volunteers.index');
    Route::get('/get-volunteers', [StaffVolunteerController::class, 'getData'])->name('volunteers.get-data');
    Route::post('/volunteers/{id}/status', [StaffVolunteerController::class, 'setStatus'])->name('volunteers.set-status');
    Route::put('/volunteers/{id}', [StaffVolunteerController::class, 'update'])->name('volunteers.update');
    Route::get('/volunteers/{id}/assignments', [StaffVolunteerController::class, 'assignments'])->name('volunteers.assignments');
    Route::post('/volunteers/{id}/assignments', [StaffVolunteerController::class, 'storeAssignment'])->name('volunteers.assignments.store');
    Route::delete('/volunteers/{id}/assignments/{assignment}', [StaffVolunteerController::class, 'destroyAssignment'])->name('volunteers.assignments.destroy');
    Route::post('/volunteers/{id}/attendance', [StaffVolunteerController::class, 'storeAttendance'])->name('volunteers.attendance.store');
});
