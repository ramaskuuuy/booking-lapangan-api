<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerReviewController extends Controller
{
    /**
     * Tampilkan semua ulasan untuk lapangan milik owner ini
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('pemilik_lapangan')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $reviews = Review::with(['user:id,name', 'court:id,name'])
            ->whereHas('court', function ($q) use ($user) {
                $q->where('owner_id', $user->id);
            })
            ->latest()
            ->paginate(15);

        return response()->json($reviews);
    }
}
