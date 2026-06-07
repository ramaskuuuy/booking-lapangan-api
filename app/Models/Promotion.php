<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
    'court_id',
    'sport_type',
    'title',
    'code',
    'description',
    'discount_percent',
    'valid_from',
    'valid_until',
    'banner_image',
    'is_active',
];

    protected function casts(): array
    {
        return [
            'discount_percent' => 'decimal:2',
            'valid_from'       => 'date',
            'valid_until'      => 'date',
            'is_active'        => 'boolean',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /**
     * Promotion dimiliki oleh Court (BelongsTo)
     */
    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    /**
     * Filter hanya promosi yang sedang aktif dan dalam periode berlaku
     */
    public function scopeActive(Builder $query): Builder
    {
        $today = Carbon::today();

        return $query->where('is_active', true)
                     ->where('valid_from', '<=', $today)
                     ->where('valid_until', '>=', $today);
    }

    // ─── Methods ──────────────────────────────────────────────────────────────

    /**
     * Terapkan diskon ke harga tertentu
     */
    public function applyDiscount(float $originalPrice): float
    {
        $discountAmount = $originalPrice * ($this->discount_percent / 100);

        return round($originalPrice - $discountAmount, 2);
    }
}
