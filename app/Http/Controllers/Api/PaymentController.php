<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Requests\Payment\UploadProofRequest;
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
        $statusCode    = (string) $request->input('status_code');

        if ($statusCode === '200') {
            $payment = Payment::where('booking_id', $orderId)->firstOrFail();

            // Hindari proses dobel kalau webhook terkirim lebih dari sekali
            if ($payment->status !== 'paid') {
                $payment->processPayment($transactionId);
            }
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

    /**
     * Upload bukti transfer / QRIS oleh user, status jadi waiting_confirmation
     */
    public function uploadProof(UploadProofRequest $request, Payment $payment): JsonResponse
    {
        if ($payment->status === 'paid') {
            return response()->json(['message' => 'Booking ini sudah dibayar.'], 422);
        }

        $path = $request->file('proof_image')->store('payment-proofs', 'public');

        $payment->update([
            'proof_image'        => $path,
            'proof_uploaded_at'  => now(),
            'transferred_amount' => $request->transferred_amount,
            'status'             => 'waiting_confirmation',
        ]);

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diupload, menunggu konfirmasi admin.',
            'payment' => $payment->fresh(),
        ]);
    }

    /**
     * Daftar payment yang menunggu konfirmasi admin (status waiting_confirmation)
     */
    public function pendingConfirmations(): JsonResponse
    {
        $payments = Payment::with(['booking.user', 'booking.court'])
            ->where('status', 'waiting_confirmation')
            ->latest()
            ->paginate(10);

        return response()->json($payments);
    }

    /**
     * Tolak bukti pembayaran yang diupload user, kembalikan status ke unpaid
     */
    public function reject(Request $request, Payment $payment): JsonResponse
    {
        if ($payment->status !== 'waiting_confirmation') {
            return response()->json([
                'message' => 'Payment ini tidak dalam status menunggu konfirmasi.',
            ], 422);
        }

        $payment->update([
            'status'              => 'unpaid',
            'proof_image'         => null,
            'proof_uploaded_at'   => null,
            'transferred_amount'  => null,
        ]);

        return response()->json([
            'message' => 'Bukti pembayaran ditolak, silakan upload ulang.',
            'payment' => $payment->fresh(),
        ]);
    }
}
