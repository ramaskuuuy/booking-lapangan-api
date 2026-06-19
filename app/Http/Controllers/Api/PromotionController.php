<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Promotion\StorePromotionRequest;
use App\Http\Requests\Promotion\UpdatePromotionRequest;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    /**
     * Daftar semua promosi (bisa filter per court / aktif)
     */
    public function index(Request $request): JsonResponse
    {
        $promotions = Promotion::with('court')
            ->when($request->court_id, fn($q, $v) => $q->where('court_id', $v))
            ->when($request->active, fn($q) => $q->active())
            ->paginate(10);

        return response()->json($promotions);
    }

    /**
     * Buat promosi baru
     */
    public function store(StorePromotionRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('banner_image')) {
            $data['banner_image'] = $request->file('banner_image')->store('promotions', 'public');
        }

        $promotion = Promotion::create($data);

        return response()->json([
            'message'   => 'Promosi berhasil ditambahkan.',
            'promotion' => $promotion->load('court'),
        ], 201);
    }

    /**
     * Detail promosi
     */
    public function show(Promotion $promotion): JsonResponse
    {
        return response()->json($promotion->load('court'));
    }

    /**
     * Update promosi
     */
    public function update(UpdatePromotionRequest $request, Promotion $promotion): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('banner_image')) {
            $data['banner_image'] = $request->file('banner_image')->store('promotions', 'public');
        }

        $promotion->update($data);

        return response()->json([
            'message'   => 'Promosi berhasil diperbarui.',
            'promotion' => $promotion->fresh()->load('court'),
        ]);
    }

    /**
     * Hapus promosi
     */
    public function destroy(Promotion $promotion): JsonResponse
    {
        $promotion->delete();

        return response()->json([
            'message' => 'Promosi berhasil dihapus.',
        ]);
    }
}
