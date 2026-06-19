<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    /**
     * Administrator bisa melakukan semua aksi
     */
    public function before(User $user): ?bool
    {
        if ($user->hasRole('administrator')) {
            return true;
        }
        return null;
    }

    /**
     * User hanya bisa lihat booking milik sendiri
     * Pemilik lapangan bisa lihat semua booking
     */
    public function view(User $user, Booking $booking): bool
    {
        if ($user->hasRole('user')) {
            return $user->id == $booking->user_id;
        }

        if ($user->hasRole('pemilik_lapangan')) {
            return true;
        }

        return false;
    }

    /**
     * Hanya user pemilik booking yang bisa cancel (jika masih pending)
     */
    public function cancel(User $user, Booking $booking): bool
    {
        if ($booking->status !== 'pending') {
            return false;
        }

        return $user->id == $booking->user_id;
    }

    /**
     * Hanya admin yang bisa update booking
     */
    public function update(User $user, Booking $booking): bool
    {
        return $user->hasRole('administrator');
    }
}