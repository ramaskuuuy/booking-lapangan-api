<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CourtController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PromotionController;
use Illuminate\Support\Facades\Route;

// ─── Public Routes (tanpa autentikasi) ───────────────────────────────────────
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Payment gateway webhook
Route::post('/payments/callback', [PaymentController::class, 'handleCallback']);

// Court & Promotion bisa dilihat publik
Route::get('/courts',                 [CourtController::class,     'index']);
Route::get('/courts/{court}',         [CourtController::class,     'show']);
Route::get('/promotions',             [PromotionController::class, 'index']);
Route::get('/promotions/{promotion}', [PromotionController::class, 'show']);

// ─── Authenticated Routes ─────────────────────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout',  [AuthController::class, 'logout']);
    Route::get('/profile',  [AuthController::class, 'profile']);
    Route::put('/profile',  [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'updatePassword']);
    

    // Booking
    Route::get('/bookings',                    [BookingController::class, 'index']);
    Route::post('/bookings',                   [BookingController::class, 'store']);
    Route::get('/bookings/{booking}',          [BookingController::class, 'show']);
    Route::post('/bookings/{booking}/cancel',  [BookingController::class, 'cancel']);

    // Payment
    Route::post('/payments',          [PaymentController::class, 'store']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);

    // ─── Admin & Pemilik Lapangan ─────────────────────────────────────────────

    Route::middleware('role:administrator|pemilik_lapangan')->group(function () {
        // CRUD COURT
        Route::post('/courts',           [CourtController::class, 'store']);
        Route::put('/courts/{court}',    [CourtController::class, 'update']);
        Route::delete('/courts/{court}', [CourtController::class, 'destroy']);
        // CRUD PROMOTION
        Route::post('/promotions',              [PromotionController::class, 'store']);
        Route::put('/promotions/{promotion}',   [PromotionController::class, 'update']);
        Route::delete('/promotions/{promotion}',[PromotionController::class, 'destroy']);

        Route::get('/courts/{court}/bookings', [BookingController::class, 'courtBookings']);
    });

    // ─── Admin Only ───────────────────────────────────────────────────────────

    Route::middleware('role:administrator')->group(function () {

        Route::put('/bookings/{booking}',           [BookingController::class,  'update']);
        Route::post('/payments/{payment}/confirm',  [PaymentController::class,  'confirm']);
    });
});