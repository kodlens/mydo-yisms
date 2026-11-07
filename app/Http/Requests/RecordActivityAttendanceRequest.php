<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecordActivityAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && in_array($this->user()->role, ['admin', 'staff'], true);
    }

    public function rules(): array
    {
        return [
            'reference_code' => ['required', 'string', 'max:50'],
            'method' => ['required', Rule::in(['qr', 'manual'])],
            'remarks' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'reference_code.required' => 'A youth reference code is required.',
            'method.required' => 'The check-in method must be specified.',
            'method.in' => 'The check-in method must be either QR or manual.',
        ];
    }
}
