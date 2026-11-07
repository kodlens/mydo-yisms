<?php

namespace App\Http\Requests\CashIncentives;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCashIncentiveProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'staff' || $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $programId = $this->route('program') instanceof \App\Models\CashIncentiveProgram
            ? $this->route('program')->id
            : $this->route('program');

        return [
            'code' => ['nullable', 'string', 'max:50', Rule::unique('cash_incentive_programs', 'code')->ignore($programId)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:3000'],
            'funding_year' => ['required', 'integer', 'min:2020', 'max:2050'],
            'amount_per_beneficiary' => ['required', 'numeric', 'min:1'],
            'allocated_budget' => ['required', 'numeric', 'min:1'],
            'max_beneficiaries' => ['required', 'integer', 'min:1'],
            'selection_start_date' => ['nullable', 'date'],
            'selection_end_date' => ['nullable', 'date', 'after_or_equal:selection_start_date'],
            'release_start_date' => ['nullable', 'date'],
            'release_end_date' => ['nullable', 'date', 'after_or_equal:release_start_date'],
            'status' => ['required', 'string', 'in:draft,active,completed,cancelled'],
        ];
    }
}
