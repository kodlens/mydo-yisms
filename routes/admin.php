<?php


Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/dashboard', [App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard.index');


    Route::resource('/scholarship-types', App\Http\Controllers\Admin\AdminScholarshipTypeController::class)->names('scholarship-types');
    Route::get('/get-scholarship-types', [App\Http\Controllers\Admin\AdminScholarshipTypeController::class, 'getData'])->name('scholarship-types.get-data');
    Route::post('/scholarship-types/{id}/active', [App\Http\Controllers\Admin\AdminScholarshipTypeController::class, 'setActive'])->name('scholarship-types.set-active');




    Route::resource('/users', App\Http\Controllers\Admin\AdminUserController::class)->names('users');
    Route::get('/get-users', [App\Http\Controllers\Admin\AdminUserController::class, 'getData'])->name('users.getdata');
    //Route::post('/users-change-password/{id}', [App\Http\Controllers\Admin\AdminUserController::class, 'changePassword'])->name('admin.users.change-password');
    Route::post('/change-password/{id}', [App\Http\Controllers\Admin\AdminUserController::class, 'changePassword'])->name('users.change-password');


});
