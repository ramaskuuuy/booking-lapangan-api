<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Court\StoreCourtRequest;
use App\Http\Requests\Court\UpdateCourtRequest;
use App\Models\Court;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourtController extends Controller
{
    /**
     * Tampilkan daftar semua court (dengan filter opsional)
     */
    public function index(Request $request): JsonResponse
    {
        $courts = Court::query()
            ->active()
            ->when($request->sport_type, fn($q, $v) => $q->bySport($v))
            ->when($request->type, fn($q, $v) => $q->where('type', $v))
            ->with('promotions')
            ->paginate(10);

        return response()->json($courts);
    }

    /**
     * Simpan court baru (hanya admin / pemilik lapangan)
     */
    public function store(StoreCourtRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('courts', 'public');
        }

        $court = Court::create($data);

        return response()->json([
            'message' => 'Court berhasil ditambahkan.',
            'court'   => $court,
        ], 201);
    }

    /**
     * Tampilkan detail court
     */
    public function show(Court $court): JsonResponse
    {
        $court->load(['bookings' => fn($q) => $q->latest()->limit(5), 'promotions' => fn($q) => $q->active()]);

        return response()->json($court);
    }

    /**
     * Update data court
     */
    public function update(UpdateCourtRequest $request, Court $court): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('courts', 'public');
        }

        $court->update($data);

        return response()->json([
            'message' => 'Court berhasil diperbarui.',
            'court'   => $court,
        ]);
    }

    /**
     * Hapus court
     */
    public function destroy(Court $court): JsonResponse
    {
        $court->delete();

        return response()->json([
            'message' => 'Court berhasil dihapus.',
        ]);
    }
}
