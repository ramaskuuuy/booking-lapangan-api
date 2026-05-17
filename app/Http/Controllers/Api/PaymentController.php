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
        $payment = Payment::where('booking_id', $request->booking_id)
            ->firstOrFail();

        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'Booking ini sudah dibayar.',
            ], 422);
        }

        $payment->update([
            'payment_method' => $request->payment_method,
            'status'         => 'unpaid',
        ]);

        // TODO: Integrasi Midtrans / Xendit
        // Contoh: kembalikan snap_token Midtrans ke frontend
        // $snapToken = MidtransService::createTransaction($payment);

        return response()->json([
            'message' => 'Silakan lanjutkan pembayaran.',
            'payment' => $payment->load('booking.court'),
            'invoice' => $payment->generateInvoice(),
            // 'snap_token' => $snapToken, // uncomment setelah integrasi Midtrans
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
     * Return type diubah dari void ke JsonResponse
     */
    public function handleCallback(Request $request): JsonResponse
    {
        // Verifikasi signature dari payment gateway
        // TODO: Tambahkan verifikasi signature Midtrans/Xendit di sini
        // if (!$this->verifySignature($request)) {
        //     return response()->json(['message' => 'Invalid signature.'], 403);
        // }

        $transactionId = $request->input('transaction_id');
        $orderId       = $request->input('order_id'); // ini booking_id
        $statusCode    = $request->input('status_code');

        if ($statusCode === '200') {
            $payment = Payment::where('booking_id', $orderId)->first();

            if (! $payment) {
                return response()->json(['message' => 'Payment tidak ditemukan.'], 404);
            }

            if ($payment->status === 'paid') {
                return response()->json(['message' => 'Payment sudah diproses.'], 200);
            }

            $payment->processPayment($transactionId);
        }

        
        return response()->json(['message' => 'OK'], 200);
    }

    /**
     * Konfirmasi pembayaran manual — hanya admin
     */
    public function confirm(Payment $payment): JsonResponse
    {
        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'Pembayaran sudah terkonfirmasi.',
            ], 422);
        }

        $payment->processPayment('MANUAL-' . Str::upper(Str::random(10)));

        return response()->json([
            'message' => 'Pembayaran berhasil dikonfirmasi.',
            'payment' => $payment->fresh()->load('booking.court'),
        ]);
    }
}