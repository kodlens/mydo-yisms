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
            'youth_profile_id' => ['required_without:youth_profile_ids', 'nullable', 'integer', 'exists:youth_profiles,id'],
            'youth_profile_ids' => ['required_without:youth_profile_id', 'nullable', 'array', 'min:1'],
            'youth_profile_ids.*' => ['integer', 'exists:youth_profiles,id'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
