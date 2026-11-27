<?php

namespace App\Http\Requests\Sk;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Validator;

class StoreSkRegistrationRequest extends FormRequest
{
    public const POSITIONS = [
        'SK Chairperson',
        'SK Kagawad',
        'SK Secretary',
        'SK Treasurer',
        'SK Federation Officer',
    ];

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $email = strtolower((string) $this->email);

        $normalizePhone = function ($phone) {
            $digits = preg_replace('/\D+/', '', (string) $phone);
            if (str_starts_with($digits, '639') && strlen($digits) === 12) {
                return '0' . substr($digits, 2);
            }

            return $digits;
        };

        $this->merge([
            'email' => $email,
            'mobile_number' => $normalizePhone($this->mobile_number),
            'sk_position' => $this->filled('sk_position') ? trim((string) $this->sk_position) : null,
        ]);
    }

    public function rules(): array
    {
        $youngestAllowedBirthDate = now()->subYears(15)->toDateString();
        $oldestAllowedBirthDate = now()->subYears(31)->addDay()->toDateString();

        return [
            'email' => ['required', 'string', 'email', 'max:100', 'unique:youth_profiles,email'],
            'password' => ['required', 'confirmed'],

            'lname' => ['required', 'string', 'max:255'],
            'fname' => ['required', 'string', 'max:255'],
            'mname' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:30'],
            'birth_date' => ['required', 'date', "before_or_equal:{$youngestAllowedBirthDate}", "after_or_equal:{$oldestAllowedBirthDate}"],
            'sex' => ['required', 'string', 'in:Female,Male'],
            'civil_status' => ['required', 'string', 'in:Single,Married,Widowed,Separated'],
            'mobile_number' => ['required', 'string', 'max:30', 'regex:/^09[0-9]{9}$/'],

            'provCode' => ['required', 'exists:provinces,provCode'],
            'citymunCode' => ['required', 'exists:cities,citymunCode'],
            'brgyCode' => ['required', 'exists:barangays,brgyCode'],
            'street_address' => ['required', 'string', 'max:255'],
            'zip_code' => ['nullable', 'string', 'max:10'],

            'sk_position' => ['required', 'string', 'in:' . implode(',', self::POSITIONS)],
            'school_id' => ['required', 'array', 'min:1'],
        ];
    }

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

                $rawFilename = data_get($this->input('school_id'), '0.response.filename');
                $filename = $rawFilename ? basename((string) $rawFilename) : '';
                $tempPath = "temp/{$filename}";
                $disk = Storage::disk('public');

                if ($filename === '' || ! $disk->exists($tempPath)) {
                    $validator->errors()->add('school_id', 'Uploading a valid SK Official ID or Certificate of Proclamation image (PNG, JPG, or JPEG) is required.');
                } else {
                    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                    $mime = $disk->mimeType($tempPath);
                    $validExt = in_array($ext, ['png', 'jpg', 'jpeg'], true);
                    $validMime = in_array($mime, ['image/png', 'image/jpeg'], true);

                    if (! $validExt || ! $validMime) {
                        $validator->errors()->add('school_id', 'The uploaded SK ID must strictly be a PNG, JPG, or JPEG image.');
                    }
                }
            },
        ];
    }

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
            'sk_position' => 'SK position',
            'school_id' => 'SK Official ID image',
        ];
    }

    public function messages(): array
    {
        return [
            'birth_date.before_or_equal' => 'The SK official must be at least 15 years old.',
            'birth_date.after_or_equal' => 'The SK official must not be older than 30 years old.',
            'school_id.required' => 'Uploading your SK Official ID image (PNG, JPG, or JPEG) is required for registration.',
            'school_id.min' => 'Uploading your SK Official ID image (PNG, JPG, or JPEG) is required for registration.',
        ];
    }
}
