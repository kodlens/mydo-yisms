<?php


Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/dashboard', [App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard.index');


    Route::resource('/scholarship-types', App\Http\Controllers\Admin\AdminScholarshipTypeController::class)->names('scholarship-types.index');
    Route::get('/get-scholarship-types', [App\Http\Controllers\Admin\AdminScholarshipTypeController::class, 'getData'])->name('scholarship-types.get-data');

});
