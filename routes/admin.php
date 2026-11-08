<?php


Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/dashboard', [App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard.index');

    Route::resource('/activity-categories', App\Http\Controllers\Admin\AdminActivityCategoryController::class)->names('activity-categories');
    Route::get('/get-activity-categories', [App\Http\Controllers\Admin\AdminActivityCategoryController::class, 'getData'])->name('activity-categories.get-data');
    Route::post('/activity-categories/{id}/active', [App\Http\Controllers\Admin\AdminActivityCategoryController::class, 'setActive'])->name('activity-categories.set-active');

    Route::resource('/scholarship-types', App\Http\Controllers\Admin\AdminScholarshipTypeController::class)->names('scholarship-types');
    Route::get('/get-scholarship-types', [App\Http\Controllers\Admin\AdminScholarshipTypeController::class, 'getData'])->name('scholarship-types.get-data');
    Route::post('/scholarship-types/{id}/active', [App\Http\Controllers\Admin\AdminScholarshipTypeController::class, 'setActive'])->name('scholarship-types.set-active');

    Route::resource('/users', App\Http\Controllers\Admin\AdminUserController::class)->names('users');
    Route::get('/get-users', [App\Http\Controllers\Admin\AdminUserController::class, 'getData'])->name('users.getdata');
    Route::post('/change-password/{id}', [App\Http\Controllers\Admin\AdminUserController::class, 'changePassword'])->name('users.change-password');
    Route::post('/users/{id}/change-password', [App\Http\Controllers\Admin\AdminUserController::class, 'changePassword'])->name('users.change-password.alt');

    // Scholarship Applicants
    Route::patch('/applicants/{applicant}/status', [App\Http\Controllers\Admin\AdminApplicantController::class, 'updateStatus'])->name('applicants.status.update');
    Route::resource('/applicants', App\Http\Controllers\Admin\AdminApplicantController::class)->names('applicants');
    Route::get('/get-applicants', [App\Http\Controllers\Admin\AdminApplicantController::class, 'getData'])->name('applicants.get-data');

    // Youth Profiles
    Route::resource('/youth-profiles', App\Http\Controllers\Admin\AdminYouthProfileController::class)->names('youth-profiles');
    Route::get('/get-youth-profiles', [App\Http\Controllers\Admin\AdminYouthProfileController::class, 'getData'])->name('youth-profiles.get-data');
    Route::post('/youth-profiles/{id}/change-password', [App\Http\Controllers\Admin\AdminYouthProfileController::class, 'changePassword'])->name('youth-profiles.change-password');

    // Cash Incentives Management
    Route::prefix('cash-incentives')->name('cash-incentives.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveProgramController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveProgramController::class, 'store'])->name('store');
        Route::get('/{program}', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveProgramController::class, 'show'])->name('show');
        Route::put('/{program}', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveProgramController::class, 'update'])->name('update');
        Route::delete('/{program}', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveProgramController::class, 'destroy'])->name('destroy');

        // Beneficiary Selection & Review
        Route::get('/{program}/eligible-youth', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveBeneficiaryController::class, 'eligibleYouth'])->name('eligible-youth');
        Route::post('/{program}/beneficiaries/select', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveBeneficiaryController::class, 'select'])->name('beneficiaries.select');
        Route::post('/{program}/beneficiaries/{beneficiary}/review', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveBeneficiaryController::class, 'review'])->name('beneficiaries.review');
        Route::delete('/{program}/beneficiaries/{beneficiary}', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveBeneficiaryController::class, 'destroy'])->name('beneficiaries.destroy');

        // Cash Release Management
        Route::post('/{program}/releases/{beneficiary}/record', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveReleaseController::class, 'record'])->name('releases.record');
        Route::post('/{program}/releases/{beneficiary}/revert', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveReleaseController::class, 'revert'])->name('releases.revert');
        Route::post('/{program}/releases/batch', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveReleaseController::class, 'batch'])->name('releases.batch');
        Route::post('/{program}/releases/{release}/status', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveReleaseController::class, 'updateStatus'])->name('releases.status');

        // Reports & Export
        Route::get('/{program}/reports/summary', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveReportController::class, 'summary'])->name('reports.summary');
        Route::get('/{program}/reports/export-csv', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveReportController::class, 'exportCsv'])->name('reports.export-csv');
        Route::get('/{program}/beneficiaries/{beneficiary}/report', [\App\Http\Controllers\Admin\CashIncentives\AdminCashIncentiveReportController::class, 'individual'])->name('reports.individual');
    });

    // Activity Logs
    Route::get('/activity-logs', [\App\Http\Controllers\Admin\AdminActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::get('/get-activity-logs', [\App\Http\Controllers\Admin\AdminActivityLogController::class, 'getData'])->name('activity-logs.get-data');
    Route::get('/activity-logs/{id}', [\App\Http\Controllers\Admin\AdminActivityLogController::class, 'show'])->name('activity-logs.show');

});
