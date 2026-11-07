<?php

namespace App\Http\Requests\CashIncentives;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReleaseStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'staff' || $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:scheduled,unclaimed,cancelled'],
            'scheduled_release_date' => ['required_if:status,scheduled', 'nullable', 'date'],
            'cancellation_reason' => ['required_if:status,cancelled', 'nullable', 'string', 'max:1500'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
