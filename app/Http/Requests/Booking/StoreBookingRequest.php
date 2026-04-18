<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'court_id'    => ['required', 'exists:courts,id'],
            'date'        => ['required', 'date', 'after_or_equal:today'],
            'start_time'  => ['required', 'date_format:H:i'],
            'end_time'    => ['required', 'date_format:H:i', 'after:start_time'],
            'total_price' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'court_id.required'    => 'Court wajib dipilih.',
            'court_id.exists'      => 'Court tidak ditemukan.',
            'date.required'        => 'Tanggal booking wajib diisi.',
            'date.after_or_equal'  => 'Tanggal booking tidak boleh di masa lalu.',
            'start_time.required'  => 'Waktu mulai wajib diisi.',
            'end_time.required'    => 'Waktu selesai wajib diisi.',
            'end_time.after'       => 'Waktu selesai harus setelah waktu mulai.',
            'total_price.required' => 'Total harga wajib diisi.',
        ];
    }
}
