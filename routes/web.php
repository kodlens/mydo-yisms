<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

//open route
Route::get('/load-provinces', [App\Http\Controllers\OpenController::class, 'loadProvinces']);
Route::get('/load-cities', [App\Http\Controllers\OpenController::class, 'loadCities']);
Route::get('/load-barangays', [App\Http\Controllers\OpenController::class, 'loadBarangays']);


Route::post('/temp-upload', [App\Http\Controllers\Base\UploadFileController::class, 'tempUpload'])->name('open.temp-upload');
Route::post('/temp-remove/{filename}', [App\Http\Controllers\Base\UploadFileController::class, 'tempRemove'])->name('open.temp-remove');




require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/youth.php';
require __DIR__.'/sk.php';
require __DIR__.'/admin.php';
require __DIR__.'/staff.php';



//testing routes purpose
use App\Events\MydoTestEvent;

Route::get('/test', function () {
   return Inertia::render('broadcast-test');
});

Route::get('/test-broadcast', function () {

    MydoTestEvent::dispatch('Hello from MYDO!');

    return response()->json([
        'success' => true,
        'message' => 'Broadcast event dispatched!',
    ]);
});


Route::get('/preview-password-reset-email', function () {
    $user = \App\Models\YouthProfile::first() ?? \App\Models\User::first();
    $url = url(route('password.reset', [
        'token' => 'sample-reset-token-demo12345',
        'email' => $user->email ?? 'youth@example.com',
    ], false));

    return view('emails.password-reset', [
        'url' => $url,
        'user' => $user,
        'count' => 60,
    ]);
});

use Illuminate\Support\Facades\Mail;
Route::get('/test-email', function () {
    Mail::raw('This is a test email from Laravel using Gmail SMTP.', function ($message) {
        $message->to('mail.etienne08@gmail.com')
            ->subject('Laravel Gmail SMTP Test');
    });

    return 'Email sent successfully!';
});

Route::get('/test-reset-email', function () {
    $user = \App\Models\YouthProfile::where('email', 'mail.etienne08@gmail.com')->first()
        ?? \App\Models\YouthProfile::first()
        ?? \App\Models\User::first();

    $url = url(route('password.reset', [
        'token' => 'sample-test-token-12345',
        'email' => 'mail.etienne08@gmail.com',
    ], false));

    Mail::send('emails.password-reset', [
        'url' => $url,
        'user' => $user,
        'count' => 60,
    ], function ($message) {
        $message->to('mail.etienne08@gmail.com')
            ->subject('Reset Your Password - eKabataan MYDO (Test Preview)');
    });

    return 'Styled password reset email sent successfully to mail.etienne08@gmail.com!';
});
