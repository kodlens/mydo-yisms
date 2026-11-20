<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['guards' => ['web', 'youth']]);

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('staff-notifications', function ($user) {
    return $user && ($user->role === 'staff' || $user->role === 'admin');
}, ['guards' => ['web']]);

Broadcast::channel('youth-notifications.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
}, ['guards' => ['youth']]);
