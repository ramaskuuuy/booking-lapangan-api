<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'booking_id'     => ['required', 'exists:bookings,id'],
            'payment_method' => ['required', 'string', 'in:transfer,qris,cash,midtrans,xendit'],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.required'     => 'Booking wajib dipilih.',
            'booking_id.exists'       => 'Booking tidak ditemukan.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'payment_method.in'       => 'Metode pembayaran tidak valid.',
        ];
    }
}
