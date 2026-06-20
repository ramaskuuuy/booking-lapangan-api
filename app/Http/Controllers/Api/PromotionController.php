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
        $user = $request->user('sanctum'); // Gunakan guard sanctum agar public access tetap aman

        $promotions = Promotion::with('court')
            ->when($request->court_id, fn($q, $v) => $q->where('court_id', $v))
            ->when($user && $user->hasRole('pemilik_lapangan') && !$user->hasRole('administrator'), function($q) use ($user) {
                // Tampilkan hanya promosi yang terkait dengan lapangan milik owner
                $q->whereHas('court', function($query) use ($user) {
                    $query->where('owner_id', $user->id);
                });
            })
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
        $user = $request->user();

        // Validasi owner
        if ($user->hasRole('pemilik_lapangan') && !$user->hasRole('administrator')) {
            if (!empty($data['court_id'])) {
                $court = \App\Models\Court::find($data['court_id']);
                if (!$court || $court->owner_id !== $user->id) {
                    return response()->json(['message' => 'Anda tidak berhak membuat promosi untuk lapangan ini.'], 403);
                }
            } else {
                // Pemilik lapangan wajib set court_id
                return response()->json(['message' => 'Pemilik lapangan wajib memilih lapangan untuk promosi.'], 403);
            }
        }

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
        $user = $request->user();

        if ($user->hasRole('pemilik_lapangan') && !$user->hasRole('administrator')) {
            $promotion->load('court');
            if ($promotion->court && $promotion->court->owner_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            if ($request->has('court_id') && $request->court_id != $promotion->court_id) {
                $court = \App\Models\Court::find($request->court_id);
                if (!$court || $court->owner_id !== $user->id) {
                    return response()->json(['message' => 'Unauthorized.'], 403);
                }
            }
        }

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
    public function destroy(Request $request, Promotion $promotion): JsonResponse
    {
        $user = $request->user();

        if ($user->hasRole('pemilik_lapangan') && !$user->hasRole('administrator')) {
            $promotion->load('court');
            if ($promotion->court && $promotion->court->owner_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $promotion->delete();

        return response()->json([
            'message' => 'Promosi berhasil dihapus.',
        ]);
    }
}
