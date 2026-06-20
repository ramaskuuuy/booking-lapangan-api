<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->select('id', 'name', 'email', 'phone', 'created_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (User $user) {
                return [
                    'id'         => $user->id,
                    'name'       => $user->name,
                    'email'      => $user->email,
                    'phone'      => $user->phone,
                    'role'       => $user->getRoleNames()->first() ?? 'user',
                    'created_at' => $user->created_at?->toDateTimeString(),
                ];
            });

        return response()->json([
            'data' => $users,
        ]);
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(['administrator', 'pemilik_lapangan', 'user'])],
        ]);

        $user->syncRoles([$validated['role']]);

        return response()->json([
            'message' => 'Role berhasil diperbarui.',
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->getRoleNames()->first() ?? 'user',
            ],
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
{
    if ($request->user()?->id === $user->id) {
        return response()->json([
            'message' => 'Tidak bisa menghapus akun sendiri.',
        ], 422);
    }

    $user->syncRoles([]);
    $user->tokens()->delete();
    $user->delete();

    return response()->json([
        'message' => 'User berhasil dihapus.',
    ]);
}
}