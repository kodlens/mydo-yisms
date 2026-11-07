<?php

namespace App\Http\Requests\CashIncentives;

use Illuminate\Foundation\Http\FormRequest;

class ReviewBeneficiaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'staff' || $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:approved,rejected'],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:1500'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
