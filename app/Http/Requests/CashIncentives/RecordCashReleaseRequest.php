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
            'acknowledgment_reference' => ['required', 'string', 'max:100'],
            'actual_release_date' => ['nullable', 'date'],
            'supporting_document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'], // 10MB max
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
