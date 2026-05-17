<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Requests\Booking\UpdateBookingRequest;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Payment;
use App\Models\Promotion;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class BookingController extends Controller
{
    use AuthorizesRequests;
    /**
     * Daftar booking:
     * - User biasa   → hanya booking milik sendiri
     * - Pemilik/Admin → semua booking (bisa filter)
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Booking::with(['court', 'payment']);

        if ($user->hasAnyRole(['administrator', 'pemilik_lapangan'])) {
            // Admin & pemilik lapangan bisa lihat semua booking
            $query->when($request->user_id, fn($q, $v) => $q->where('user_id', $v));
        } else {
            // User biasa hanya lihat booking sendiri
            $query->where('user_id', $user->id);
        }

        $bookings = $query
            ->when($request->status, fn($q, $v) => $q->byStatus($v))
            ->when($request->court_id, fn($q, $v) => $q->where('court_id', $v))
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => $bookings->items(),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page'    => $bookings->lastPage(),
                'per_page'     => $bookings->perPage(),
                'total'        => $bookings->total(),
            ],
        ]);
    }

    /**
     * Buat booking baru dengan harga dihitung otomatis di server
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $validated         = $request->validated();
        $validated['user_id'] = $request->user()->id;

        // Cek konflik booking (overlap waktu) untuk court yang sama
        $conflict = Booking::where('court_id', $validated['court_id'])
            ->where('date', $validated['date'])
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) use ($validated) {
                // Overlap terjadi jika: start_baru < end_lama AND end_baru > start_lama
                $q->where('start_time', '<', $validated['end_time'])
                  ->where('end_time', '>', $validated['start_time']);
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Court sudah dibooking pada waktu tersebut.',
            ], 422);
        }

        // Hitung total price berdasarkan durasi dan harga per jam court
        $court    = Court::findOrFail($validated['court_id']);
        $start    = Carbon::parse($validated['start_time']);
        $end      = Carbon::parse($validated['end_time']);
        $hours    = abs($end->diffInMinutes($start)) / 60;
        $basePrice = round($hours * $court->price_per_hour, 2);

        // Cek promo aktif untuk court tersebut
        $promo = Promotion::where('court_id', $court->id)->active()->first();
        $validated['total_price'] = $promo
            ? $promo->applyDiscount($basePrice)
            : $basePrice;

        $booking = Booking::create($validated);

        // Auto-buat record Payment dengan status unpaid
        Payment::create([
            'booking_id'     => $booking->id,
            'amount'         => $booking->total_price,
            'payment_method' => '',
            'status'         => 'unpaid',
        ]);

        $booking->load(['court', 'payment']);

        return response()->json([
            'message'        => 'Booking berhasil dibuat.',
            'booking'        => $booking,
            'promo_applied'  => $promo ? $promo->title : null,
            'original_price' => $basePrice,
            'final_price'    => $booking->total_price,
        ], 201);
    }

    /**
     * Detail booking (dengan authorization)
     */
    public function show(Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        $booking->load(['user', 'court', 'payment']);

        return response()->json($booking);
    }

    /**
     * Update booking — hanya admin
     */
    public function update(UpdateBookingRequest $request, Booking $booking): JsonResponse
    {
        $booking->update($request->validated());

        return response()->json([
            'message' => 'Booking berhasil diperbarui.',
            'booking' => $booking->fresh()->load(['court', 'payment']),
        ]);
    }

    /**
     * Batalkan booking (user pemilik atau admin)
     */
    public function cancel(Booking $booking): JsonResponse
    {
        $this->authorize('cancel', $booking);

        if ($booking->status === 'cancelled') {
            return response()->json([
                'message' => 'Booking sudah dibatalkan sebelumnya.',
            ], 422);
        }

        if ($booking->status === 'confirmed') {
            return response()->json([
                'message' => 'Booking yang sudah confirmed tidak bisa dibatalkan langsung. Hubungi admin.',
            ], 422);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Booking berhasil dibatalkan.',
            'booking' => $booking->fresh(),
        ]);
    }

    /**
     * Daftar booking per court — untuk Pemilik Lapangan & Admin
     */
    public function courtBookings(Request $request, Court $court): JsonResponse
    {
        $bookings = Booking::with(['user', 'payment'])
            ->where('court_id', $court->id)
            ->when($request->status, fn($q, $v) => $q->byStatus($v))
            ->when($request->date,   fn($q, $v) => $q->where('date', $v))
            ->latest()
            ->paginate(10);

        return response()->json([
            'court' => $court->name,
            'data'  => $bookings->items(),
            'meta'  => [
                'current_page' => $bookings->currentPage(),
                'last_page'    => $bookings->lastPage(),
                'per_page'     => $bookings->perPage(),
                'total'        => $bookings->total(),
            ],
        ]);
    }
}