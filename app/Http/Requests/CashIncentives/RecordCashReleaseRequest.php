<?php

namespace App\Http\Requests\CashIncentives;

use Illuminate\Foundation\Http\FormRequest;

class RecordCashReleaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'staff' || $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'amount' => ['nullable', 'numeric', 'min:0.01'],
            'acknowledgment_reference' => ['nullable', 'string', 'max:100'],
            'actual_release_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
