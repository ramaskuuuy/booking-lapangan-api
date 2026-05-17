<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function before(User $user): ?bool
    {
        if ($user->hasRole('administrator')) {  
            return true;
        }
        return null;
    }

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

    public function cancel(User $user, Booking $booking): bool  
    {
        if ($booking->status !== 'pending') {
            return false;
        }
        return $user->id == $booking->user_id;
    }

    public function update(User $user, Booking $booking): bool
    {
        return $user->hasRole('administrator'); 
    }
}