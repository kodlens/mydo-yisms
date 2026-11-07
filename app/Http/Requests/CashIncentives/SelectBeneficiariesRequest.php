<?php

namespace App\Http\Requests\CashIncentives;

use Illuminate\Foundation\Http\FormRequest;

class SelectBeneficiariesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'staff' || $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'youth_profile_id' => ['required', 'integer', 'exists:youth_profiles,id'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
