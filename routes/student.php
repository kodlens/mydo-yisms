<?php


Route::middleware('guest')->group(function () {
    Route::get('/student-login', [App\Http\Controllers\Student\AuthController::class, 'index'])->name('student-login.index');
    Route::post('/student-login', [App\Http\Controllers\Student\AuthController::class, 'login'])->name('student-login.login');

    Route::get('/student-register', [App\Http\Controllers\Student\StudentRegistrationController::class, 'index'])->name('student-register.index');
    Route::post('/student-register', [App\Http\Controllers\Student\StudentRegistrationController::class, 'store'])->name('student-register.store');

});

Route::middleware('auth:student')->group(function () {
    Route::post('student-logout', [App\Http\Controllers\Student\AuthController::class, 'destroy'])
        ->name('student-logout');



    Route::get('/student/dashboard', [App\Http\Controllers\Student\StudentDashboardController::class, 'index'])->name('student.dashboard.index');

    Route::get('/student/my-account', [App\Http\Controllers\Student\StudentMyAccountController::class, 'index'])->name('student.my-account.index');



});

