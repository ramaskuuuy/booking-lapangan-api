<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        // Buat user admin default
        $admin = User::firstOrCreate(
            ['email' => 'admin@booking.com'],
            [
                'name'     => 'Administrator',
                'password' => Hash::make('password'),
                'phone'    => '08111111111',
            ]
        );
        $admin->assignRole('administrator');

        // Buat user pemilik lapangan contoh
        $owner = User::firstOrCreate(
            ['email' => 'owner@booking.com'],
            [
                'name'     => 'Pemilik Lapangan',
                'password' => Hash::make('password'),
                'phone'    => '08222222222',
            ]
        );
        $owner->assignRole('pemilik_lapangan');

        // Buat user biasa contoh
        $user = User::firstOrCreate(
            ['email' => 'user@booking.com'],
            [
                'name'     => 'User Biasa',
                'password' => Hash::make('password'),
                'phone'    => '08333333333',
            ]
        );
        $user->assignRole('user');

        $this->command->info('Seeder selesai! Akun default berhasil dibuat.');
    }
}
