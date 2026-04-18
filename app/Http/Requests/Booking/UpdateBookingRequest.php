<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Hanya admin yang bisa update booking secara penuh
        return $this->user()->hasRole('administrator');
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::in(['pending', 'confirmed', 'cancelled'])],
            'date'   => ['sometimes', 'date'],
        ];
    }
}
