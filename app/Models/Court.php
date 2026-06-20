<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Court extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'location',
        'description',
        'sport_type',
        'type',
        'price_per_hour',
        'facilities',
        'rating',
        'review_count',
        'image',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_per_hour' => 'decimal:2',
            'facilities'     => 'array',
            'rating'         => 'decimal:1',
            'review_count'   => 'integer',
            'is_active'      => 'boolean',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /**
     * Court dimiliki oleh User/Owner (BelongsTo)
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

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

    /**
     * Court memiliki banyak Review (1:N)
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Court memiliki banyak Jadwal Operasional (1:N)
     */
    public function operationalHours(): HasMany
    {
        return $this->hasMany(CourtOperationalHour::class);
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

    /**
     * Filter court milik owner tertentu
     */
    public function scopeOwnedBy(Builder $query, int $ownerId): Builder
    {
        return $query->where('owner_id', $ownerId);
    }

    // ─── Methods ──────────────────────────────────────────────────────────────

    /**
     * Update rating and review_count based on related reviews
     */
    public function updateRating(): void
    {
        $this->update([
            'rating' => $this->reviews()->avg('rating') ?? 0,
            'review_count' => $this->reviews()->count(),
        ]);
    }
}
