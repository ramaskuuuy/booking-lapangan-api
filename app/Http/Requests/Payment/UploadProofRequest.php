<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class UploadProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'proof_image'        => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'transferred_amount' => ['required', 'numeric', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'proof_image.required'        => 'Bukti pembayaran wajib diupload.',
            'proof_image.image'           => 'File harus berupa gambar.',
            'proof_image.mimes'           => 'Format gambar harus jpg, jpeg, atau png.',
            'proof_image.max'             => 'Ukuran gambar maksimal 2MB.',
            'transferred_amount.required' => 'Nominal transfer wajib diisi.',
            'transferred_amount.numeric'  => 'Nominal transfer harus berupa angka.',
            'transferred_amount.min'      => 'Nominal transfer tidak valid.',
        ];
    }
}