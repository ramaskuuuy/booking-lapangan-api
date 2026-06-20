<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Court\StoreCourtRequest;
use App\Http\Requests\Court\UpdateCourtRequest;
use App\Models\Court;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CourtController extends Controller
{
    /**
     * Tampilkan daftar semua court (dengan filter opsional)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user('sanctum'); // Gunakan guard sanctum agar public access tetap aman

        $courts = Court::query()
            // Jika pemilik lapangan → hanya tampilkan miliknya sendiri
            // Jika admin atau publik → tampilkan semua yang aktif
            ->when(
                $user && $user->hasRole('pemilik_lapangan') && !$user->hasRole('administrator'),
                fn($q) => $q->ownedBy($user->id),
                fn($q) => $q->active()
            )

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

            // Filter eksplisit by owner_id (dipakai dari owner dashboard)
            ->when(
                $request->filled('owner_id'),
                fn ($q) => $q->where('owner_id', $request->owner_id)
            )

            ->with(['promotions', 'owner:id,name'])
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

        // Jika pemilik lapangan yang membuat, otomatis set owner_id
        $user = $request->user();
        if ($user->hasRole('pemilik_lapangan') && !$user->hasRole('administrator')) {
            $data['owner_id'] = $user->id;
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
    public function show(Request $request, Court $court): JsonResponse
    {
        // Jika dibutuhkan pengecekan khusus, bisa tambah logic pakai $request->user('sanctum')
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
        // Pemilik lapangan hanya bisa update court miliknya sendiri
        $user = $request->user();
        if (
            $user->hasRole('pemilik_lapangan') &&
            !$user->hasRole('administrator') &&
            $court->owner_id !== $user->id
        ) {
            return response()->json(['message' => 'Anda tidak berhak mengedit lapangan ini.'], 403);
        }

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
    public function destroy(Request $request, Court $court): JsonResponse
    {
        // Pemilik lapangan hanya bisa hapus court miliknya sendiri
        $user = $request->user();
        if (
            $user->hasRole('pemilik_lapangan') &&
            !$user->hasRole('administrator') &&
            $court->owner_id !== $user->id
        ) {
            return response()->json(['message' => 'Anda tidak berhak menghapus lapangan ini.'], 403);
        }

        $court->delete();

        return response()->json([
            'message' => 'Court berhasil dihapus.',
        ]);
    }

    /**
     * Mengecek ketersediaan jam pada tanggal tertentu
     */
    public function availability(Request $request, Court $court): JsonResponse
    {
        $request->validate([
            'date' => 'required|date_format:Y-m-d'
        ]);

        $dateStr = $request->date;
        $dateObj = Carbon::parse($dateStr);
        // dayOfWeek di Carbon: 0=Sunday, 1=Monday... 6=Saturday
        // Operational hours di database: mungkin 1=Monday... 7=Sunday? Tergantung implementasi.
        // Kita asumsikan standar ISO 1=Senin, 7=Minggu. Carbon isIsoWeekday() 1=Senin, 7=Minggu
        $dayOfWeek = $dateObj->isoWeekday();

        $operationalHour = $court->operationalHours()->where('day_of_week', $dayOfWeek)->first();

        // Default open 06:00 and close 23:00 if no operational hours configured
        $openTimeStr = $operationalHour ? $operationalHour->open_time : '06:00:00';
        $closeTimeStr = $operationalHour ? $operationalHour->close_time : '23:00:00';
        $isClosed = $operationalHour ? $operationalHour->is_closed : false;

        if ($isClosed) {
            return response()->json([
                'is_open' => false,
                'message' => 'Lapangan tutup pada hari ini.',
                'slots' => []
            ]);
        }

        // Ambil semua booking di tanggal ini yang tidak dicancel
        $bookings = Booking::where('court_id', $court->id)
            ->where('date', $dateStr)
            ->where('status', '!=', 'cancelled')
            ->get();

        $openTime = Carbon::parse($openTimeStr);
        $closeTime = Carbon::parse($closeTimeStr);

        $slots = [];

        // Generate per 1 jam
        $currentTime = $openTime->copy();
        while ($currentTime->lt($closeTime)) {
            $slotStart = $currentTime->format('H:i');
            $slotEndObj = $currentTime->copy()->addHour();
            $slotEnd = $slotEndObj->format('H:i');

            // Cek apakah slot ini tabrakan dengan booking yang ada
            $isAvailable = true;
            foreach ($bookings as $booking) {
                // Booking tabrakan jika (start1 < end2) AND (start2 < end1)
                $bStart = Carbon::parse($booking->start_time)->format('H:i');
                $bEnd = Carbon::parse($booking->end_time)->format('H:i');

                if ($slotStart < $bEnd && $bStart < $slotEnd) {
                    $isAvailable = false;
                    break;
                }
            }

            $slots[] = [
                'time' => $slotStart,
                'available' => $isAvailable
            ];

            $currentTime->addHour();
        }

        return response()->json([
            'is_open' => true,
            'slots' => $slots
        ]);
    }
}
