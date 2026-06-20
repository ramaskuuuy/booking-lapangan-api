<?php
$owner = \App\Models\User::whereHas('roles', fn($q) => $q->where('name', 'pemilik_lapangan'))->first();
if ($owner) {
    \App\Models\Court::whereNull('owner_id')->update(['owner_id' => $owner->id]);
    echo 'Done';
} else {
    echo 'No owner found';
}
