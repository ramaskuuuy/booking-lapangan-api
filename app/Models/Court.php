<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Court extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sport_type',
        'type',
        'price_per_hour',
        'facilities',
        'image',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_per_hour' => 'decimal:2',
            'is_active'      => 'boolean',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /**
     * Court memiliki banyak Booking (1:N)
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Court memiliki banyak Promotion (1:N)
     */
    public function promotions(): HasMany
    {
        return $this->hasMany(Promotion::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    /**
     * Filter hanya court yang aktif
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Filter court berdasarkan jenis olahraga
     */
    public function scopeBySport(Builder $query, string $sportType): Builder
    {
        return $query->where('sport_type', $sportType);
    }
}
