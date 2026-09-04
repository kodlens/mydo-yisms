<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentAccountApproved
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $student = $request->user('student');

        if ($student && $student->registration_status !== 'approved') {
            return redirect()->route('student.pending-page.index');
        }

        return $next($request);
    }
}
