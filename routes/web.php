<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('publisher/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('publisher.dashboard');

    Route::get('encoder/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('encoder.dashboard');

    Route::get('external-encoder/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('external-encoder.dashboard');

    Route::get('admin/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('admin.dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
