<?php


Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/dashboard', [App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard.index');

    Route::resource('/activity-categories', App\Http\Controllers\Admin\AdminActivityCategoryController::class)->names('activity-categories');
    Route::get('/get-activity-categories', [App\Http\Controllers\Admin\AdminActivityCategoryController::class, 'getData'])->name('activity-categories.get-data');
    Route::post('/activity-categories/{id}/active', [App\Http\Controllers\Admin\AdminActivityCategoryController::class, 'setActive'])->name('activity-categories.set-active');

    Route::resource('/scholarship-types', App\Http\Controllers\Admin\AdminScholarshipTypeController::class)->names('scholarship-types');
    Route::get('/get-scholarship-types', [App\Http\Controllers\Admin\AdminScholarshipTypeController::class, 'getData'])->name('scholarship-types.get-data');
    Route::post('/scholarship-types/{id}/active', [App\Http\Controllers\Admin\AdminScholarshipTypeController::class, 'setActive'])->name('scholarship-types.set-active');

    // Volunteer tracking. Assignments and attendance hang off the volunteer record.
    Route::resource('/volunteers', App\Http\Controllers\Admin\AdminVolunteerController::class)->names('volunteers');
    Route::get('/get-volunteers', [App\Http\Controllers\Admin\AdminVolunteerController::class, 'getData'])->name('volunteers.get-data');
    Route::post('/volunteers/{id}/status', [App\Http\Controllers\Admin\AdminVolunteerController::class, 'setStatus'])->name('volunteers.set-status');
    Route::get('/volunteers/{id}/assignments', [App\Http\Controllers\Admin\AdminVolunteerController::class, 'assignments'])->name('volunteers.assignments');
    Route::post('/volunteers/{id}/assignments', [App\Http\Controllers\Admin\AdminVolunteerController::class, 'storeAssignment'])->name('volunteers.assignments.store');
    Route::delete('/volunteers/{id}/assignments/{assignment}', [App\Http\Controllers\Admin\AdminVolunteerController::class, 'destroyAssignment'])->name('volunteers.assignments.destroy');
    Route::post('/volunteers/{id}/attendance', [App\Http\Controllers\Admin\AdminVolunteerController::class, 'storeAttendance'])->name('volunteers.attendance.store');




    Route::resource('/users', App\Http\Controllers\Admin\AdminUserController::class)->names('users');
    Route::get('/get-users', [App\Http\Controllers\Admin\AdminUserController::class, 'getData'])->name('users.getdata');
    //Route::post('/users-change-password/{id}', [App\Http\Controllers\Admin\AdminUserController::class, 'changePassword'])->name('admin.users.change-password');
    Route::post('/change-password/{id}', [App\Http\Controllers\Admin\AdminUserController::class, 'changePassword'])->name('users.change-password');


});
