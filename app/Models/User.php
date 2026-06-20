<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /**
     * User memiliki banyak Booking (1:N)
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * User memiliki banyak Review yang ditulisnya (1:N)
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * User bisa menerima Notification (Polymorphic - bawaan Laravel)
     * Sudah di-handle otomatis oleh trait Notifiable.
     * Akses: $user->notifications
     */

    // ─── Methods ──────────────────────────────────────────────────────────────

    /**
     * Cek apakah user adalah administrator
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('administrator');
    }

    /**
     * Cek apakah user adalah pemilik lapangan
     */
    public function isPemilikLapangan(): bool
    {
        return $this->hasRole('pemilik_lapangan');
    }
}
