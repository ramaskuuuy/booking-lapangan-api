<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CourtController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OwnerBookingController;
use App\Http\Controllers\Api\OwnerDashboardController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\CourtOperationalHourController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\OwnerReviewController;
use Illuminate\Support\Facades\Route;

// ─── Public Routes (tanpa autentikasi) ────────────────────────────────────────

// Rate limiting — max 10 request per menit untuk auth
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Webhook payment gateway (diakses oleh Midtrans/Xendit, tidak perlu token)
Route::post('/payments/callback', [PaymentController::class, 'handleCallback']);

// Court & Promotion bisa dilihat publik tanpa login
Route::get('/courts',                 [CourtController::class,     'index']);
Route::get('/courts/{court}',         [CourtController::class,     'show']);
Route::get('/courts/{court}/availability', [CourtController::class,  'availability']);
Route::get('/courts/{court}/reviews', [ReviewController::class,    'index']);
Route::get('/promotions',             [PromotionController::class, 'index']);
Route::get('/promotions/{promotion}', [PromotionController::class, 'show']);

// ─── Authenticated Routes (butuh token Sanctum) ───────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ──────────────────────────────────────────────────────────────────
    Route::post('/logout',          [AuthController::class, 'logout']);
    Route::get('/profile',          [AuthController::class, 'profile']);
    Route::put('/profile',          [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'changePassword']);

    // ── Booking ───────────────────────────────────────────────────────────────
    Route::get('/bookings',                   [BookingController::class, 'index']);
    Route::post('/bookings',                  [BookingController::class, 'store']);
    Route::get('/bookings/{booking}',         [BookingController::class, 'show']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::post('/bookings/{booking}/reviews',[ReviewController::class,  'store']);

    // ── Payment ───────────────────────────────────────────────────────────────
    Route::post('/payments',                        [PaymentController::class, 'store']);
    Route::get('/payments/{payment}',               [PaymentController::class, 'show']);
    Route::post('/payments/{payment}/upload-proof', [PaymentController::class, 'uploadProof']);

    // ── Notifications ─────────────────────────────────────────────────────────
    Route::get('/notifications',            [NotificationController::class, 'index']);
    Route::post('/notifications/read-all',  [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // ─── Admin & Pemilik Lapangan ─────────────────────────────────────────────
    Route::middleware('role:administrator|pemilik_lapangan')->group(function () {

        // CRUD Court
        Route::post('/courts',           [CourtController::class, 'store']);
        Route::put('/courts/{court}',    [CourtController::class, 'update']);
        Route::delete('/courts/{court}', [CourtController::class, 'destroy']);

        // CRUD Promotion
        Route::post('/promotions',               [PromotionController::class, 'store']);
        Route::put('/promotions/{promotion}',    [PromotionController::class, 'update']);
        Route::delete('/promotions/{promotion}', [PromotionController::class, 'destroy']);

        // Lihat booking per court
        Route::get('/courts/{court}/bookings', [BookingController::class, 'courtBookings']);

        // Payment management — lihat antrian & tolak bukti
        Route::get('/payments/pending-confirmations', [PaymentController::class, 'pendingConfirmations']);
        Route::post('/payments/{payment}/reject',     [PaymentController::class, 'reject']);
    });

    // ─── Pemilik Lapangan Only ────────────────────────────────────────────────
    Route::middleware('role:pemilik_lapangan')->group(function () {
        Route::get('/owner/dashboard',          [OwnerDashboardController::class, 'index']);
        Route::get('/owner/reports/revenue',    [OwnerDashboardController::class, 'revenueReport']);
        Route::get('/owner/reports/transactions',[OwnerDashboardController::class, 'transactionReport']);
        
        Route::get('/owner/bookings',           [OwnerBookingController::class, 'index']);
        Route::get('/owner/bookings/{booking}', [OwnerBookingController::class, 'show']);
        Route::post('/owner/bookings/{booking}/confirm', [OwnerBookingController::class, 'confirm']);
        Route::post('/owner/bookings/{booking}/reject',  [OwnerBookingController::class, 'reject']);

        Route::get('/owner/reviews', [OwnerReviewController::class, 'index']);

        // Jadwal Operasional
        Route::get('/owner/courts/{court}/operational-hours', [CourtOperationalHourController::class, 'index']);
        Route::put('/owner/courts/{court}/operational-hours', [CourtOperationalHourController::class, 'updateBatch']);
    });

    // ─── Admin Only ───────────────────────────────────────────────────────────
    Route::middleware('role:administrator')->group(function () {

        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);

        Route::get('/admin/activity-logs', [ActivityLogController::class, 'index']);

        Route::put('/bookings/{booking}',          [BookingController::class,  'update']);
        Route::get('/payments',                    [PaymentController::class,  'index']);
        Route::post('/payments/{payment}/confirm', [PaymentController::class,  'confirm']);

        Route::get('/admin/users',             [AdminUserController::class, 'index']);
        Route::put('/admin/users/{user}/role', [AdminUserController::class, 'updateRole']);
        Route::delete('/admin/users/{user}',   [AdminUserController::class, 'destroy']);
    });
});
