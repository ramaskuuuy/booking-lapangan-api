<?php

namespace App\Http\Requests\Promotion;

use Illuminate\Foundation\Http\FormRequest;

class StorePromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['administrator', 'pemilik_lapangan']);
    }

    public function rules(): array
    {
        return [
            'court_id'         => ['required', 'exists:courts,id'],
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'discount_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'valid_from'       => ['required', 'date'],
            'valid_until'      => ['required', 'date', 'after_or_equal:valid_from'],
            'banner_image'     => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active'        => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'court_id.required'         => 'Court wajib dipilih.',
            'title.required'            => 'Judul promosi wajib diisi.',
            'discount_percent.required' => 'Persentase diskon wajib diisi.',
            'discount_percent.max'      => 'Diskon tidak boleh lebih dari 100%.',
            'valid_until.after_or_equal'=> 'Tanggal berakhir harus setelah tanggal mulai.',
        ];
    }
}
