<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Payment;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Dashboard khusus Pemilik Lapangan.
 * Mengembalikan statistik dan data yang hanya relevan dengan lapangan milik owner yang login.
 */
class OwnerDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user    = $request->user();
        $courtIds = Court::where('owner_id', $user->id)->pluck('id');

        $totalCourts   = $courtIds->count();
        $totalBookings = Booking::whereIn('court_id', $courtIds)->count();
        $pendingBookings   = Booking::whereIn('court_id', $courtIds)->where('status', 'pending')->count();
        $confirmedBookings = Booking::whereIn('court_id', $courtIds)->where('status', 'confirmed')->count();
        $completedBookings = Booking::whereIn('court_id', $courtIds)->where('status', 'completed')->count();
        $cancelledBookings = Booking::whereIn('court_id', $courtIds)->where('status', 'cancelled')->count();

        // Pendapatan dari booking yang sudah dikonfirmasi atau selesai
        $totalRevenue = Booking::whereIn('court_id', $courtIds)
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_price');

        // Promo aktif yang terhubung ke lapangan milik owner
        $activePromos = Promotion::whereIn('court_id', $courtIds)
            ->where('is_active', true)
            ->where('valid_from', '<=', now())
            ->where('valid_until', '>=', now())
            ->count();

        // Recent bookings (8 terakhir)
        $recentBookings = Booking::with(['user:id,name', 'court:id,name,sport_type'])
            ->whereIn('court_id', $courtIds)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn($b) => [
                'id'           => $b->id,
                'booking_code' => 'BK' . str_pad((string) $b->id, 3, '0', STR_PAD_LEFT),
                'user_name'    => $b->user->name ?? '-',
                'court_name'   => $b->court->name ?? '-',
                'sport_type'   => $b->court->sport_type ?? '-',
                'booking_date' => $b->date,
                'start_time'   => $b->start_time,
                'end_time'     => $b->end_time,
                'status'       => $b->status ?? 'pending',
                'total_price'  => $b->total_price ?? 0,
            ]);

        return response()->json([
            'stats' => [
                'total_courts'      => $totalCourts,
                'total_bookings'    => $totalBookings,
                'pending_bookings'  => $pendingBookings,
                'confirmed_bookings' => $confirmedBookings,
                'completed_bookings' => $completedBookings,
                'cancelled_bookings' => $cancelledBookings,
                'total_revenue'     => $totalRevenue,
                'active_promos'     => $activePromos,
            ],
            'recent_bookings' => $recentBookings,
        ]);
    }

    /**
     * Laporan Pendapatan (Revenue Report)
     */
    public function revenueReport(Request $request): JsonResponse
    {
        $user     = $request->user();
        $courtIds = Court::where('owner_id', $user->id)->pluck('id');

        $period = $request->query('period', 'monthly'); // daily, weekly, monthly

        $query = Booking::whereIn('court_id', $courtIds)
            ->whereIn('status', ['confirmed', 'completed']);

        if ($period === 'daily') {
            $query->whereDate('created_at', '>=', now()->subDays(30));
            $grouped = $query->get()->groupBy(fn($b) => $b->created_at->format('Y-m-d'));
        } elseif ($period === 'weekly') {
            $query->whereDate('created_at', '>=', now()->subWeeks(12));
            $grouped = $query->get()->groupBy(fn($b) => $b->created_at->format('Y-W'));
        } else {
            $query->whereDate('created_at', '>=', now()->subMonths(12));
            $grouped = $query->get()->groupBy(fn($b) => $b->created_at->format('Y-m'));
        }

        $revenueData = [];
        foreach ($grouped as $key => $bookings) {
            $revenueData[] = [
                'period' => $key,
                'revenue' => $bookings->sum('total_price'),
                'bookings_count' => $bookings->count(),
            ];
        }

        // Sort ascending by period
        usort($revenueData, fn($a, $b) => strcmp($a['period'], $b['period']));

        return response()->json([
            'period' => $period,
            'data' => $revenueData,
            'total_revenue' => collect($revenueData)->sum('revenue')
        ]);
    }

    /**
     * Laporan Transaksi (Transaction Report)
     */
    public function transactionReport(Request $request): JsonResponse
    {
        $user     = $request->user();
        $courtIds = Court::where('owner_id', $user->id)->pluck('id');

        $transactions = Payment::with(['booking.user', 'booking.court'])
            ->whereHas('booking', function ($q) use ($courtIds) {
                $q->whereIn('court_id', $courtIds);
            })
            ->latest()
            ->paginate(20);

        return response()->json($transactions);
    }
}
