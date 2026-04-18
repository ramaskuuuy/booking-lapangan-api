<?php

namespace App\Http\Requests\Court;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourtRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Hanya admin dan pemilik_lapangan yang boleh membuat court
        return $this->user()->hasAnyRole(['administrator', 'pemilik_lapangan']);
    }

    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'sport_type'     => ['required', Rule::in(['padel', 'tennis', 'badminton', 'basketball', 'futsal'])],
            'type'           => ['required', Rule::in(['indoor', 'outdoor'])],
            'price_per_hour' => ['required', 'numeric', 'min:0'],
            'facilities'     => ['nullable', 'string'],
            'image'          => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active'      => ['boolean'],
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
