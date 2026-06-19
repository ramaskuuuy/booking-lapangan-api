<?php

namespace App\Models;

use App\Notifications\PaymentSuccessNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'amount',
        'payment_method',
        'transaction_id',
        'status',
        'proof_image',
        'proof_uploaded_at',
        'transferred_amount',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'transferred_amount' => 'decimal:2',
            'proof_uploaded_at' => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /**
     * Payment dimiliki oleh Booking (BelongsTo)
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    // ─── Methods ──────────────────────────────────────────────────────────────

    /**
     * Proses pembayaran dan update status
     */
    public function processPayment(string $transactionId): bool
    {
        $this->update([
            'transaction_id' => $transactionId,
            'status'         => 'paid',
        ]);

        // Update status booking menjadi confirmed
        $this->booking->update(['status' => 'confirmed']);

        // Kirim notifikasi ke user
        $this->booking->user->notify(new PaymentSuccessNotification($this));

        return true;
    }

    /**
     * Generate nomor invoice
     */
    public function generateInvoice(): string
    {
        return 'INV-' . strtoupper(date('Ymd')) . '-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }
}
