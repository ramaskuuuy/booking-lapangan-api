<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Tampilkan daftar ulasan untuk lapangan tertentu secara publik
     */
    public function index(Court $court): JsonResponse
    {
        $reviews = $court->reviews()->with('user:id,name')->latest()->paginate(10);
        return response()->json($reviews);
    }

    /**
     * Simpan ulasan baru untuk sebuah booking
     */
    public function store(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();

        // Pastikan user ini adalah pemilik booking
        if ($booking->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Pastikan status booking sudah completed
        if ($booking->status !== 'completed') {
            return response()->json(['message' => 'Anda hanya bisa memberikan ulasan setelah selesai bermain (booking completed).'], 422);
        }

        // Pastikan belum pernah review
        if ($booking->review()->exists()) {
            return response()->json(['message' => 'Anda sudah memberikan ulasan untuk booking ini.'], 422);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'booking_id' => $booking->id,
            'court_id'   => $booking->court_id,
            'user_id'    => $user->id,
            'rating'     => $validated['rating'],
            'comment'    => $validated['comment'],
        ]);

        return response()->json([
            'message' => 'Ulasan berhasil dikirim.',
            'review'  => $review->load('user:id,name'),
        ], 201);
    }
}
