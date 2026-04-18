<?php

namespace App\Http\Requests\Promotion;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['administrator', 'pemilik_lapangan']);
    }

    public function rules(): array
    {
        return [
            'title'            => ['sometimes', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'discount_percent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'valid_from'       => ['sometimes', 'date'],
            'valid_until'      => ['sometimes', 'date', 'after_or_equal:valid_from'],
            'banner_image'     => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active'        => ['boolean'],
        ];
    }
}
