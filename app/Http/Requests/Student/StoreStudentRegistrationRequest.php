<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use Illuminate\Validation\Rules\Password;

class StoreStudentRegistrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower((string) $this->email),
            'mobile_number' => preg_replace('/\D+/', '', (string) $this->mobile_number),
            'guardian_contact_number' => preg_replace('/\D+/', '', (string) $this->guardian_contact_number),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:30', 'alpha_dash:ascii', 'unique:students,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:students,email'],
            'password' => ['required', 'confirmed', Password::defaults()],

            'lname' => ['required', 'string', 'max:255'],
            'fname' => ['required', 'string', 'max:255'],
            'mname' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:30'],
            'birth_date' => ['required', 'date', 'before:today'],
            'sex' => ['required', 'string', 'in:Female,Male'],
            'civil_status' => ['required', 'string', 'in:Single,Married,Widowed,Separated'],
            'mobile_number' => ['required', 'string', 'max:30', 'regex:/^09[0-9]{9}$/'],

            'provCode' => ['required', 'string', 'exists:provinces,provCode'],
            'citymunCode' => ['required', 'string', 'exists:cities,citymunCode'],
            'brgyCode' => ['required', 'string', 'exists:barangays,brgyCode'],
            'street_address' => ['required', 'string', 'max:255'],
            'zip_code' => ['nullable', 'string', 'max:10'],

            'school_name' => ['required', 'string', 'max:255'],
            'program' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'between:1,4'],

            'guardian_name' => ['required', 'string', 'max:255'],
            'guardian_contact_number' => ['required', 'string', 'max:30', 'regex:/^09[0-9]{9}$/'],
            'monthly_family_income' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $cityBelongsToProvince = \App\Models\City::where('citymunCode', $this->citymunCode)
                    ->where('provCode', $this->provCode)
                    ->exists();

                if (! $cityBelongsToProvince) {
                    $validator->errors()->add('citymunCode', 'The selected city / municipality does not belong to the selected province.');
                }

                $barangayBelongsToCity = \App\Models\Barangay::where('brgyCode', $this->brgyCode)
                    ->where('citymunCode', $this->citymunCode)
                    ->exists();

                if (! $barangayBelongsToCity) {
                    $validator->errors()->add('brgyCode', 'The selected barangay does not belong to the selected city / municipality.');
                }
            },
        ];
    }

    /**
     * Get custom names for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'lname' => 'last name',
            'fname' => 'first name',
            'mname' => 'middle name',
            'provCode' => 'province',
            'citymunCode' => 'city / municipality',
            'brgyCode' => 'barangay',
        ];
    }
}
