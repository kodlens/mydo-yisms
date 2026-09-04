<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Storage;
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
        $email = strtolower((string) $this->email);

        $this->merge([
            'email' => $email,
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
        $youngestAllowedBirthDate = now()->subYears(18)->toDateString();
        $oldestAllowedBirthDate = now()->subYears(31)->addDay()->toDateString();

        return [
            'email' => ['required', 'string', 'email', 'max:255', 'unique:students,email'],
            'password' => ['required', 'confirmed', Password::defaults()],

            'lname' => ['required', 'string', 'max:255'],
            'fname' => ['required', 'string', 'max:255'],
            'mname' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:30'],
            'birth_date' => ['required', 'date', "before_or_equal:{$youngestAllowedBirthDate}", "after_or_equal:{$oldestAllowedBirthDate}"],
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
            'previous_semester_gwa' => ['nullable', 'numeric', 'between:1,5'],

            'guardian_name' => ['required', 'string', 'max:255'],
            'guardian_contact_number' => ['required', 'string', 'max:30', 'regex:/^09[0-9]{9}$/'],
            'monthly_family_income' => ['required', 'numeric', 'min:0', 'max:99999999.99'],

            'coe' => ['nullable', 'array'],
            'coe.0.response.filename' => ['nullable', 'string'],
            'cog' => ['nullable', 'array'],
            'cog.0.response.filename' => ['nullable', 'string'],
            'sedula' => ['nullable', 'array'],
            'sedula.0.response.filename' => ['nullable', 'string'],
            'school_id' => ['nullable', 'array'],
            'school_id.0.response.filename' => ['nullable', 'string'],
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

                $documentFields = [
                    'coe' => 'Certificate of Enrolment',
                    'cog' => 'Certificate of Grade',
                    'sedula' => 'Cedula',
                    'school_id' => 'School ID',
                ];
                $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];

                foreach ($documentFields as $field => $label) {
                    $filename = data_get($this->input($field), '0.response.filename');

                    if (! is_string($filename) || $filename === '') {
                        $validator->errors()->add($field, "Please upload your {$label}.");
                        continue;
                    }

                    if ($filename !== basename($filename)) {
                        $validator->errors()->add($field, "The uploaded {$label} filename is invalid.");
                        continue;
                    }

                    $from = 'temp/' . $filename;
                    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

                    if (! in_array($extension, $allowedExtensions, true)) {
                        $validator->errors()->add($field, "The uploaded {$label} must be a PDF, JPG, JPEG, or PNG file.");
                        continue;
                    }

                    if (! Storage::disk('public')->exists($from)) {
                        $validator->errors()->add($field, "The uploaded {$label} was not found. Please upload it again.");
                        continue;
                    }

                    if (Storage::disk('public')->size($from) > 5 * 1024 * 1024) {
                        $validator->errors()->add($field, "The uploaded {$label} must not be greater than 5MB.");
                    }
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
            'birth_date' => 'birth date',
            'provCode' => 'province',
            'citymunCode' => 'city / municipality',
            'brgyCode' => 'barangay',
            'previous_semester_gwa' => 'GWA for previous semester',
            'coe' => 'certificate of enrolment',
            'cog' => 'certificate of grade',
            'sedula' => 'cedula',
            'school_id' => 'school ID',
        ];
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'birth_date.before_or_equal' => 'The applicant must be at least 18 years old.',
            'birth_date.after_or_equal' => 'The applicant must not be older than 30 years old.',
        ];
    }
}
