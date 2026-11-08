<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;



class YouthMyProfileController extends Controller
{
    public function index(){

        $youth = Auth::guard('youth')->user();
        $youth->load(['province', 'city', 'barangay']);

        return Inertia::render('youth/my-profile/youth-my-profile-page', [
            'youth' => $youth
        ]);
    }

    public function update(Request $request)
    {
        /** @var YouthProfile $youth */
        $youth = Auth::guard('youth')->user();

        $validated = $request->validate([
            'mobile_number' => ['required', 'string', 'max:30', 'regex:/^(09|\+639)[0-9]{9}$/'],
            'school_name' => ['nullable', 'string', 'max:255'],
            'school_address' => ['nullable', 'string', 'max:255'],
            'program' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'between:1,6'],
            'student_id' => ['nullable', 'string', 'max:50'],
            'is_graduated' => ['nullable', 'boolean'],
            'guardian_name' => ['required', 'string', 'max:255'],
            'guardian_contact_number' => ['required', 'string', 'max:30', 'regex:/^(09|\+639)[0-9]{9}$/'],
            'monthly_family_income' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
        ]);

        $normalizePhone = function ($phone) {
            $digits = preg_replace('/\D+/', '', (string) $phone);
            if (str_starts_with($digits, '639') && strlen($digits) === 12) {
                return '0' . substr($digits, 2);
            }
            return $digits;
        };

        $youth->update([
            'mobile_number' => $normalizePhone($validated['mobile_number']),
            'school_name' => $validated['school_name'] ? trim($validated['school_name']) : null,
            'school_address' => $validated['school_address'] ? trim($validated['school_address']) : null,
            'program' => $validated['program'] ? trim($validated['program']) : null,
            'year' => $validated['year'] ?? null,
            'student_id' => $validated['student_id'] ? trim($validated['student_id']) : null,
            'is_graduated' => (bool) ($validated['is_graduated'] ?? false),
            'guardian_name' => trim($validated['guardian_name']),
            'guardian_contact_number' => $normalizePhone($validated['guardian_contact_number']),
            'monthly_family_income' => $validated['monthly_family_income'],
        ]);

        return redirect()->route('youth.youth-my-profile.index')->with('status', 'Profile successfully updated.');
    }


}
