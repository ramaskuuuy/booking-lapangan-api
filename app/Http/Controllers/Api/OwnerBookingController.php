<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Manajemen Booking untuk Pemilik Lapangan.
 * Owner hanya bisa melihat booking dari lapangan miliknya sendiri.
 */
class OwnerBookingController extends Controller
{
    /**
     * Daftar semua booking dari lapangan milik owner yang login.
     * Mendukung filter per status dan per court.
     */
    public function index(Request $request): JsonResponse
    {
        $user     = $request->user();
        $courtIds = Court::where('owner_id', $user->id)->pluck('id');

        $bookings = Booking::with(['user:id,name,email,phone', 'court:id,name,sport_type', 'payment'])
            ->whereIn('court_id', $courtIds)
            ->when($request->filled('status'), fn($q, $v) => $q->byStatus($v))
            ->when($request->filled('court_id'), function ($q) use ($request, $courtIds) {
                // Pastikan court_id yang diminta memang milik owner
                if ($courtIds->contains((int) $request->court_id)) {
                    $q->where('court_id', $request->court_id);
                }
            })
            ->latest()
            ->paginate($request->get('per_page', 15));

        return response()->json($bookings);
    }

    /**
     * Detail booking (hanya jika lapangan milik owner yang login).
     */
    public function show(Request $request, Booking $booking): JsonResponse
    {
        $user     = $request->user();
        $courtIds = Court::where('owner_id', $user->id)->pluck('id');

        if (!$courtIds->contains($booking->court_id)) {
            return response()->json(['message' => 'Booking ini tidak ditemukan atau Anda tidak berhak mengaksesnya.'], 403);
        }

        $booking->load(['user', 'court', 'payment']);

        return response()->json($booking);
    }

    /**
     * Owner konfirmasi booking secara langsung
     */
    public function confirm(Request $request, Booking $booking): JsonResponse
    {
        $user     = $request->user();
        $courtIds = Court::where('owner_id', $user->id)->pluck('id');

        if (!$courtIds->contains($booking->court_id)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Booking yang sudah dibatalkan tidak dapat dikonfirmasi.'], 422);
        }

        $booking->update(['status' => 'confirmed']);

        if ($booking->payment && $booking->payment->status !== 'paid') {
            $booking->payment->processPayment('MANUAL-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(10)));
        }

        return response()->json([
            'message' => 'Booking berhasil dikonfirmasi.',
            'booking' => $booking->fresh()->load('user', 'court')
        ]);
    }

    /**
     * Owner tolak booking secara langsung
     */
    public function reject(Request $request, Booking $booking): JsonResponse
    {
        $user     = $request->user();
        $courtIds = Court::where('owner_id', $user->id)->pluck('id');

        if (!$courtIds->contains($booking->court_id)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($booking->status === 'completed' || $booking->status === 'cancelled') {
            return response()->json(['message' => 'Booking dalam status ini tidak dapat ditolak.'], 422);
        }

        $request->validate([
            'cancellation_reason' => 'required|string|max:1000'
        ]);

        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->cancellation_reason
        ]);

        if ($booking->payment) {
            $booking->payment->update([
                'status'              => 'unpaid',
                'proof_image'         => null,
                'proof_uploaded_at'   => null,
                'transferred_amount'  => null,
            ]);
        }

        return response()->json([
            'message' => 'Booking berhasil ditolak dan dibatalkan.',
            'booking' => $booking->fresh()->load('user', 'court')
        ]);
    }
}
