<?php

namespace App\Http\Requests\Court;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['administrator', 'pemilik_lapangan']) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('facilities') && is_string($this->facilities)) {
            $facilities = array_values(array_filter(array_map(
                'trim',
                explode(',', $this->facilities)
            )));

            $this->merge([
                'facilities' => $facilities,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name'           => ['sometimes', 'string', 'max:255'],
            'location'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'description'    => ['sometimes', 'nullable', 'string'],
            'sport_type'     => ['sometimes', Rule::in(['padel', 'tennis', 'badminton', 'basketball', 'futsal'])],
            'type'           => ['sometimes', Rule::in(['indoor', 'outdoor'])],
            'price_per_hour' => ['sometimes', 'numeric', 'min:0'],
            'facilities'     => ['sometimes', 'nullable', 'array'],
            'facilities.*'   => ['string', 'max:255'],
            'rating'         => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:5'],
            'review_count'   => ['sometimes', 'nullable', 'integer', 'min:0'],
            'image'          => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active'      => ['sometimes', 'boolean'],
        ];
    }
}
