<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'court_id',
        'date',
        'start_time',
        'end_time',
        'total_price',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date'        => 'date',
            'start_time'  => 'datetime:H:i',
            'end_time'    => 'datetime:H:i',
            'total_price' => 'decimal:2',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /**
     * Booking dimiliki oleh User (BelongsTo)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Booking dimiliki oleh Court (BelongsTo)
     */
    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    /**
     * Booking memiliki satu Payment (1:1)
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    /**
     * Filter booking berdasarkan status
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    // ─── Methods ──────────────────────────────────────────────────────────────

    /**
     * Hitung total harga berdasarkan durasi dan harga per jam court
     */
    public function calculateTotalPrice(): float
    {
        $start    = \Carbon\Carbon::parse($this->start_time);
        $end      = \Carbon\Carbon::parse($this->end_time);
        $hours    = $end->diffInMinutes($start) / 60;

        return round($hours * $this->court->price_per_hour, 2);
    }
}
