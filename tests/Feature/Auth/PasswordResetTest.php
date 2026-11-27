<?php

use App\Models\User;
use App\Models\YouthProfile;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

test('reset password link screen can be rendered', function () {
    $response = $this->get('/forgot-password');

    $response->assertStatus(200);
});

test('reset password link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('reset password screen can be rendered', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
        $response = $this->get('/reset-password/'.$notification->token);

        $response->assertStatus(200);

        return true;
    });
});

test('password can be reset with valid token', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $response = $this->post('/reset-password', [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        return true;
    });
});

test('youth reset password link can be requested', function () {
    Notification::fake();

    $youth = YouthProfile::create([
        'fname' => 'Youth',
        'lname' => 'Test',
        'email' => 'youth_' . Str::random(6) . '@example.com',
        'password' => bcrypt('old-password'),
        'school_name' => 'University of Science and Technology',
        'program' => 'BSIT',
        'year' => 2,
        'student_id' => 'ID-' . Str::random(4),
        'is_active' => true,
    ]);

    $response = $this->post('/forgot-password', ['email' => $youth->email]);

    $response->assertSessionHas('status', __('passwords.sent'));
    Notification::assertSentTo($youth, ResetPassword::class);
});

test('youth password can be reset with valid token and redirects to youth login', function () {
    Notification::fake();

    $youth = YouthProfile::create([
        'fname' => 'Youth',
        'lname' => 'Test',
        'email' => 'youth_' . Str::random(6) . '@example.com',
        'password' => bcrypt('old-password'),
        'school_name' => 'University of Science and Technology',
        'program' => 'BSIT',
        'year' => 2,
        'student_id' => 'ID-' . Str::random(4),
        'is_active' => true,
    ]);

    $this->post('/forgot-password', ['email' => $youth->email]);

    Notification::assertSentTo($youth, ResetPassword::class, function ($notification) use ($youth) {
        $response = $this->post('/reset-password', [
            'token' => $notification->token,
            'email' => $youth->email,
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('youth-login.index'));

        expect(Hash::check('new-secure-password', $youth->fresh()->password))->toBeTrue();

        return true;
    });
});

test('password reset email contains custom mydo layout and link', function () {
    $youth = YouthProfile::create([
        'fname' => 'Juan',
        'lname' => 'Dela Cruz',
        'email' => 'juan_' . Str::random(6) . '@example.com',
        'password' => bcrypt('password'),
        'school_name' => 'State University',
        'program' => 'BSIT',
        'year' => 1,
        'student_id' => 'ID-' . Str::random(4),
        'is_active' => true,
    ]);

    $notification = new ResetPassword('sample-custom-token-xyz');
    $mail = $notification->toMail($youth);

    expect($mail->subject)->toBe('Reset Your Password - eKabataan MYDO');
    expect($mail->view['html'])->toBe('emails.password-reset');
    expect($mail->view['text'])->toBe('emails.password-reset-plain');

    $rendered = view($mail->view['html'], $mail->viewData)->render();

    expect($rendered)->toContain('eKabataan • MYDO');
    expect($rendered)->toContain('Juan');
    expect($rendered)->toContain('sample-custom-token-xyz');
    expect($rendered)->toContain('Reset Password');
    expect($rendered)->toContain('e-kabataan.png');
    expect($rendered)->toContain('domingag-logo-340x.png');
});

test('preview password reset email screen can be rendered', function () {
    $response = $this->get('/preview-password-reset-email');

    $response->assertStatus(200);
    $response->assertSee('eKabataan • MYDO');
});

test('test-reset-email endpoint sends styled mail without error', function () {
    \Illuminate\Support\Facades\Mail::fake();

    $response = $this->get('/test-reset-email');

    $response->assertStatus(200);
});

