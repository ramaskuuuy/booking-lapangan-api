<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    /**
     * Kembalikan semua activity log, terbaru di atas.
     * Sertakan relasi user beserta role pertamanya.
     */
    public function index(): JsonResponse
    {
        $logs = ActivityLog::with('user')
            ->latest()
            ->paginate(50);

        // Append role ke setiap entry
        $logs->getCollection()->transform(function ($log) {
            if ($log->user) {
                $log->user->role = $log->user->getRoleNames()->first() ?? 'user';
                // Hanya expose field yang diperlukan
                $log->user->makeHidden(['created_at', 'updated_at', 'email_verified_at', 'password', 'phone', 'avatar']);
            }
            return $log;
        });

        return response()->json($logs);
    }
}
