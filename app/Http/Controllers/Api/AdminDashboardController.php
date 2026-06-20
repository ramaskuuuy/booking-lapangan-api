<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $totalUsers = User::count();
        $totalOwners = User::role('pemilik_lapangan')->count();
        $totalCourts = Court::count();
        $totalBookings = Booking::count();
        $totalPromotions = Promotion::count();

        $totalRevenue = Booking::whereIn('status', ['confirmed', 'completed'])
            ->sum('total_price');

        $recentBookings = Booking::with([
                'user:id,name',
                'court:id,name,sport_type',
            ])
            ->latest('id')
            ->limit(8)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_code' => $booking->booking_code ?? ('BK' . str_pad((string) $booking->id, 3, '0', STR_PAD_LEFT)),
                    'user_name' => $booking->user->name ?? '-',
                    'court_name' => $booking->court->name ?? '-',
                    'sport_type' => $booking->court->sport_type ?? '-',
                    'booking_date' => $booking->booking_date,
                    'start_time' => $booking->start_time ?? null,
                    'end_time' => $booking->end_time ?? null,
                    'status' => $booking->status ?? 'pending',
                    'total_price' => $booking->total_price ?? 0,
                ];
            });

        $popularCourts = Booking::selectRaw('court_id, COUNT(*) as bookings_count')
            ->whereNotNull('court_id')
            ->groupBy('court_id')
            ->orderByDesc('bookings_count')
            ->limit(5)
            ->get()
            ->map(function ($row) {
                $court = Court::select('id', 'name', 'sport_type', 'image')
                    ->find($row->court_id);

                return [
                    'id' => $court?->id,
                    'name' => $court?->name ?? '-',
                    'sport_type' => $court?->sport_type ?? '-',
                    'bookings_count' => (int) $row->bookings_count,
                    'image' => $court?->image ?? null,
                ];
            });

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_owners' => $totalOwners,
                'total_courts' => $totalCourts,
                'total_bookings' => $totalBookings,
                'total_promotions' => $totalPromotions,
                'total_revenue' => $totalRevenue,
            ],
            'recent_bookings' => $recentBookings,
            'popular_courts' => $popularCourts,
        ]);
    }
}