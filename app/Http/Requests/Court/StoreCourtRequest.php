<?php

namespace App\Http\Requests\Court;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourtRequest extends FormRequest
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
            'name'           => ['required', 'string', 'max:255'],
            'location'       => ['nullable', 'string', 'max:255'],
            'description'    => ['nullable', 'string'],
            'sport_type'     => ['required', Rule::in(['padel', 'tennis', 'badminton', 'basketball', 'futsal'])],
            'type'           => ['required', Rule::in(['indoor', 'outdoor'])],
            'price_per_hour' => ['required', 'numeric', 'min:0'],
            'facilities'     => ['nullable', 'array'],
            'facilities.*'   => ['string', 'max:255'],
            'rating'         => ['nullable', 'numeric', 'min:0', 'max:5'],
            'review_count'   => ['nullable', 'integer', 'min:0'],
            'image'          => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active'      => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'           => 'Nama court wajib diisi.',
            'sport_type.required'     => 'Jenis olahraga wajib dipilih.',
            'sport_type.in'           => 'Jenis olahraga tidak valid.',
            'type.required'           => 'Tipe court (indoor/outdoor) wajib dipilih.',
            'price_per_hour.required' => 'Harga per jam wajib diisi.',
            'price_per_hour.numeric'  => 'Harga per jam harus berupa angka.',
            'image.image'             => 'File harus berupa gambar.',
            'image.max'               => 'Ukuran gambar maksimal 2MB.',
        ];
    }
}
