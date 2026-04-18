<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Requests\Booking\UpdateBookingRequest;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * Daftar booking milik user yang sedang login
     */
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::with(['court', 'payment'])
            ->where('user_id', $request->user()->id)
            ->when($request->status, fn($q, $v) => $q->byStatus($v))
            ->latest()
            ->paginate(10);

        return response()->json($bookings);
    }

    /**
     * Buat booking baru
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;

        // Cek ketersediaan court di waktu yang dipilih
        $conflict = Booking::where('court_id', $validated['court_id'])
            ->where('date', $validated['date'])
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) use ($validated) {
                $q->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                  ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']]);
            })->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Court sudah dibooking pada waktu tersebut.',
            ], 422);
        }

        $booking = Booking::create($validated);

        // Otomatis buat record Payment dengan status unpaid
        Payment::create([
            'booking_id'     => $booking->id,
            'amount'         => $booking->total_price,
            'payment_method' => '',
            'status'         => 'unpaid',
        ]);

        $booking->load(['court', 'payment']);

        return response()->json([
            'message' => 'Booking berhasil dibuat.',
            'booking' => $booking,
        ], 201);
    }

    /**
     * Detail booking
     */
    public function show(Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        $booking->load(['user', 'court', 'payment']);

        return response()->json($booking);
    }

    /**
     * Update booking (hanya admin)
     */
    public function update(UpdateBookingRequest $request, Booking $booking): JsonResponse
    {
        $booking->update($request->validated());

        return response()->json([
            'message' => 'Booking berhasil diperbarui.',
            'booking' => $booking,
        ]);
    }

    /**
     * Batalkan booking
     */
    public function cancel(Booking $booking): JsonResponse
    {
        $this->authorize('cancel', $booking);

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Booking sudah dibatalkan sebelumnya.'], 422);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Booking berhasil dibatalkan.',
            'booking' => $booking,
        ]);
    }
}
