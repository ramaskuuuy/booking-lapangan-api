<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\CourtOperationalHour;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourtOperationalHourController extends Controller
{
    /**
     * Get operational hours for a specific court
     */
    public function index(Request $request, Court $court): JsonResponse
    {
        // Guard: Jika pemilik_lapangan, pastikan court ini miliknya
        $user = $request->user();
        if ($user && $user->hasRole('pemilik_lapangan') && !$user->hasRole('administrator')) {
            if ($court->owner_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $hours = $court->operationalHours()->orderBy('day_of_week')->get();
        return response()->json($hours);
    }

    /**
     * Update operational hours (batch update)
     */
    public function updateBatch(Request $request, Court $court): JsonResponse
    {
        // Guard: Pastikan court ini miliknya
        $user = $request->user();
        if ($user && $user->hasRole('pemilik_lapangan') && !$user->hasRole('administrator')) {
            if ($court->owner_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $validated = $request->validate([
            'hours'               => 'required|array',
            'hours.*.day_of_week' => 'required|integer|min:0|max:6',
            'hours.*.open_time'   => 'nullable|date_format:H:i',
            'hours.*.close_time'  => 'nullable|date_format:H:i',
            'hours.*.is_closed'   => 'required|boolean',
        ]);

        foreach ($validated['hours'] as $hourData) {
            CourtOperationalHour::updateOrCreate(
                ['court_id' => $court->id, 'day_of_week' => $hourData['day_of_week']],
                [
                    'open_time'  => $hourData['open_time'] ?? null,
                    'close_time' => $hourData['close_time'] ?? null,
                    'is_closed'  => $hourData['is_closed'],
                ]
            );
        }

        return response()->json([
            'message' => 'Jadwal operasional berhasil diperbarui.',
            'hours'   => $court->operationalHours()->orderBy('day_of_week')->get(),
        ]);
    }
}
