<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'court.view', 'court.create', 'court.update', 'court.delete',
            'booking.view', 'booking.create', 'booking.update', 'booking.cancel',
            'payment.view', 'payment.create', 'payment.confirm',
            'promotion.view', 'promotion.create', 'promotion.update', 'promotion.delete',
            'user.view', 'user.update', 'user.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $adminRole = Role::firstOrCreate(['name' => 'administrator', 'guard_name' => 'web']);
        $adminRole->givePermissionTo(Permission::all());

        $ownerRole = Role::firstOrCreate(['name' => 'pemilik_lapangan', 'guard_name' => 'web']);
        $ownerRole->givePermissionTo([
            'court.view', 'court.create', 'court.update',
            'booking.view',
            'payment.view', 'payment.confirm',
            'promotion.view', 'promotion.create', 'promotion.update', 'promotion.delete',
        ]);

        $userRole = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);
        $userRole->givePermissionTo([
            'court.view',
            'booking.view', 'booking.create', 'booking.cancel',
            'payment.view', 'payment.create',
            'promotion.view',
        ]);

        $this->command->info('Roles & Permissions berhasil dibuat!');
    }
}