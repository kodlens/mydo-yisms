<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user() ?? $request->user('youth');

        $allowedRoles = array_map(
            fn (string $role): string => strtolower(trim($role)),
            $roles
        );

        if (! $user) {
            if (in_array('youth', $allowedRoles, true)) {
                return redirect()->route('youth-login.index');
            }

            return redirect()->route('login');
        }

        $userRole = strtolower((string) $user->role);

        if (in_array($userRole, $allowedRoles, true)) {
            return $next($request);
        }

        $dashboardRoute = $user->dashboardRoute();

        if (Route::has($dashboardRoute)) {
            return redirect()->route($dashboardRoute);
        }

        return redirect()->route('home');
    }
}
