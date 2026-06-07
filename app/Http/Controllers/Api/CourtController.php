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

        ->when($request->filled('search'), function ($q) use ($request) {
            $search = strtolower($request->search);

            $q->where(function ($query) use ($search) {
                $query->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(location) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(sport_type) LIKE ?', ["%{$search}%"]);
            });
        })

        ->when(
            $request->filled('sport') || $request->filled('sport_type'),
            function ($q) use ($request) {
                $sport = $request->sport ?? $request->sport_type;

                $q->whereRaw(
                    'LOWER(sport_type) = ?',
                    [strtolower($sport)]
                );
            }
        )

        ->when(
            $request->filled('type'),
            fn ($q) => $q->where('type', $request->type)
        )

        ->with('promotions')
        ->paginate($request->get('per_page', 50));

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
            'court'   => $court->fresh(),
        ], 201);
    }

    /**
     * Tampilkan detail court
     */
    public function show(Court $court): JsonResponse
    {
        $court->load([
            'bookings' => fn($q) => $q->latest()->limit(5),
            'promotions' => fn($q) => $q->active()
        ]);

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
            'court'   => $court->fresh(),
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
