<?php

namespace App\Http\Requests\Court;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['administrator', 'pemilik_lapangan']);
    }

    public function rules(): array
    {
        return [
            'name'           => ['sometimes', 'string', 'max:255'],
            'sport_type'     => ['sometimes', Rule::in(['padel', 'tennis', 'badminton', 'basketball', 'futsal'])],
            'type'           => ['sometimes', Rule::in(['indoor', 'outdoor'])],
            'price_per_hour' => ['sometimes', 'numeric', 'min:0'],
            'facilities'     => ['nullable', 'string'],
            'image'          => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active'      => ['boolean'],
        ];
    }
}
