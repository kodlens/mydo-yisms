<?php


Route::middleware('auth:student')->group(function () {
    Route::post('student-logout', [AuthController::class, 'destroy'])
        ->name('student-logout');



    Route::get('/student/dashboard', [App\Http\Controllers\Student\StudentDashboardController::class, 'index'])->name('student.dashboard.index');

    Route::get('/student/my-account', [App\Http\Controllers\Student\StudentMyAccountController::class, 'index'])->name('student.my-account.index');



});

