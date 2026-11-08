<?php

use App\Http\Controllers\Staff\CashIncentives\StaffCashIncentiveProgramController;
use App\Http\Controllers\Staff\CashIncentives\StaffCashIncentiveBeneficiaryController;
use App\Http\Controllers\Staff\CashIncentives\StaffCashIncentiveReleaseController;
use App\Http\Controllers\Staff\CashIncentives\StaffCashIncentiveReportController;
use App\Http\Controllers\Staff\StaffActivityAttendanceController;
use App\Http\Controllers\Staff\StaffApplicantController;
use App\Http\Controllers\Staff\StaffEventActivityController;
use App\Http\Controllers\Staff\StaffScholarshipController;
use App\Http\Controllers\Staff\StaffVolunteerController;
use App\Http\Controllers\Staff\StaffYouthProfileController;
use App\Http\Controllers\Staff\StaffDashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:staff'])->prefix('staff')->name('staff.')->group(function () {

    Route::get('/dashboard', [StaffDashboardController::class, 'index'])->name('dashboard.index');

    Route::resource('/youth-profiles', StaffYouthProfileController::class)->names('youth-profiles');
    Route::get('/get-youth-profiles', [StaffYouthProfileController::class, 'getData'])->name('youth-profiles.get-data');


    // Scholarships Management
    Route::get('/scholarships', [StaffScholarshipController::class, 'index'])->name('scholarships.index');
    Route::get('/get-scholarships', [StaffScholarshipController::class, 'getData'])->name('scholarships.get-data');
    Route::post('/scholarships', [StaffScholarshipController::class, 'store'])->name('scholarships.store');
    Route::put('/scholarships/{id}', [StaffScholarshipController::class, 'update'])->name('scholarships.update');
    Route::post('/scholarships/{id}/toggle-status', [StaffScholarshipController::class, 'toggleStatus'])->name('scholarships.toggle-status');
    Route::delete('/scholarships/{id}', [StaffScholarshipController::class, 'destroy'])->name('scholarships.destroy');

    Route::patch('/applicants/{applicant}/status', [StaffApplicantController::class, 'updateStatus'])->name('applicants.status.update');
    Route::resource('/applicants', StaffApplicantController::class)->names('scholarship-applicants');
    Route::get('/get-applicants', [StaffApplicantController::class, 'getData'])->name('scholarship-applicants.get-data');


    // Events & activities. Spelled out instead of Route::resource because this module has no
    // show/create/edit pages; the form is a modal driven by the JSON endpoints below.
    // Literal paths are declared before the {id} routes so they are not read as an id.
    Route::get('/events-activities', [StaffEventActivityController::class, 'index'])->name('events-activities.index');
    Route::get('/events-activities/categories', [StaffEventActivityController::class, 'categories'])->name('events-activities.categories');
    Route::get('/events-activities/data', [StaffEventActivityController::class, 'data'])->name('events-activities.data');
    Route::get('/events-activities/create', [StaffEventActivityController::class, 'create'])->name('events-activities.create');
    Route::get('/events-activities/{id}/edit', [StaffEventActivityController::class, 'edit'])->name('events-activities.edit');

    Route::get('/events-activities/{id}/participants', [StaffEventActivityController::class, 'participantsPage'])->name('events-activities.participants-page');
    Route::get('/events-activities/{id}/participants/list', [StaffEventActivityController::class, 'participants'])->name('events-activities.participants');
    Route::patch('/events-activities/{id}/participants/{registration}', [StaffEventActivityController::class, 'updateParticipant'])->name('events-activities.participants.update');

    Route::get('/events-activities/{id}/attendance', [StaffActivityAttendanceController::class, 'index'])->name('events-activities.attendance.index');
    Route::get('/events-activities/{id}/attendance/data', [StaffActivityAttendanceController::class, 'data'])->name('events-activities.attendance.data');
    Route::post('/events-activities/{id}/attendance', [StaffActivityAttendanceController::class, 'record'])->name('events-activities.attendance.record');
    Route::delete('/events-activities/{id}/attendance/{attendanceId}', [StaffActivityAttendanceController::class, 'destroy'])->name('events-activities.attendance.destroy');

    Route::post('/events-activities', [StaffEventActivityController::class, 'store'])->name('events-activities.store');
    Route::put('/events-activities/{id}', [StaffEventActivityController::class, 'update'])->name('events-activities.update');
    Route::delete('/events-activities/{id}', [StaffEventActivityController::class, 'destroy'])->name('events-activities.destroy');


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

    // Cash Incentives Management
    Route::prefix('cash-incentives')->name('cash-incentives.')->group(function () {
        Route::get('/', [StaffCashIncentiveProgramController::class, 'index'])->name('index');
        Route::post('/', [StaffCashIncentiveProgramController::class, 'store'])->name('store');
        Route::get('/{program}', [StaffCashIncentiveProgramController::class, 'show'])->name('show');
        Route::put('/{program}', [StaffCashIncentiveProgramController::class, 'update'])->name('update');
        Route::delete('/{program}', [StaffCashIncentiveProgramController::class, 'destroy'])->name('destroy');

        // Beneficiary Selection & Review
        Route::get('/{program}/eligible-youth', [StaffCashIncentiveBeneficiaryController::class, 'eligibleYouth'])->name('eligible-youth');
        Route::post('/{program}/beneficiaries/select', [StaffCashIncentiveBeneficiaryController::class, 'select'])->name('beneficiaries.select');
        Route::post('/{program}/beneficiaries/{beneficiary}/review', [StaffCashIncentiveBeneficiaryController::class, 'review'])->name('beneficiaries.review');
        Route::delete('/{program}/beneficiaries/{beneficiary}', [StaffCashIncentiveBeneficiaryController::class, 'destroy'])->name('beneficiaries.destroy');

        // Cash Release Management
        Route::post('/{program}/releases/{beneficiary}/record', [StaffCashIncentiveReleaseController::class, 'record'])->name('releases.record');
        Route::post('/{program}/releases/{beneficiary}/revert', [StaffCashIncentiveReleaseController::class, 'revert'])->name('releases.revert');
        Route::post('/{program}/releases/batch', [StaffCashIncentiveReleaseController::class, 'batch'])->name('releases.batch');
        Route::post('/{program}/releases/{release}/status', [StaffCashIncentiveReleaseController::class, 'updateStatus'])->name('releases.status');

        // Reports & Export
        Route::get('/{program}/reports/summary', [StaffCashIncentiveReportController::class, 'summary'])->name('reports.summary');
        Route::get('/{program}/reports/export-csv', [StaffCashIncentiveReportController::class, 'exportCsv'])->name('reports.export-csv');
        Route::get('/{program}/beneficiaries/{beneficiary}/report', [StaffCashIncentiveReportController::class, 'individual'])->name('reports.individual');
    });
});
