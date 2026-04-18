<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Inisiasi pembayaran untuk booking
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $payment = Payment::where('booking_id', $request->booking_id)->firstOrFail();

        if ($payment->status === 'paid') {
            return response()->json(['message' => 'Booking ini sudah dibayar.'], 422);
        }

        $payment->update([
            'payment_method' => $request->payment_method,
            'status'         => 'unpaid',
        ]);

        // Di sini bisa integrasi dengan payment gateway (Midtrans, Xendit, dll)
        // Contoh: kembalikan snap_token Midtrans ke frontend
        return response()->json([
            'message' => 'Silakan lanjutkan pembayaran.',
            'payment' => $payment->load('booking.court'),
            'invoice' => $payment->generateInvoice(),
        ]);
    }

    /**
     * Tampilkan detail pembayaran
     */
    public function show(Payment $payment): JsonResponse
    {
        $payment->load(['booking.court', 'booking.user']);

        return response()->json($payment);
    }

    /**
     * Handle callback dari payment gateway (webhook)
     */
    public function handleCallback(Request $request): void
    {
        // Verifikasi signature dari payment gateway
        $transactionId = $request->input('transaction_id');
        $orderId       = $request->input('order_id'); // booking_id
        $statusCode    = $request->input('status_code');

        if ($statusCode === '200') {
            $payment = Payment::where('booking_id', $orderId)->firstOrFail();
            $payment->processPayment($transactionId);
        }
    }

    /**
     * Konfirmasi pembayaran manual (oleh admin)
     */
    public function confirm(Payment $payment): JsonResponse
    {
        if ($payment->status === 'paid') {
            return response()->json(['message' => 'Pembayaran sudah terkonfirmasi.'], 422);
        }

        $payment->processPayment('MANUAL-' . Str::upper(Str::random(10)));

        return response()->json([
            'message' => 'Pembayaran berhasil dikonfirmasi.',
            'payment' => $payment->fresh()->load('booking'),
        ]);
    }
}
