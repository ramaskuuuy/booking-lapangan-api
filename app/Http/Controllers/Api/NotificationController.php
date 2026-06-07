<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // GET /api/notifications
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($n) {
                return [
                    'id'         => $n->id,
                    'type'       => class_basename($n->type),
                    'data'       => $n->data,
                    'read_at'    => $n->read_at,
                    'created_at' => $n->created_at,
                ];
            });

        return response()->json($notifications);
    }

    // POST /api/notifications/{id}/read
    public function markAsRead(Request $request, $id)
    {
        $notif = $request->user()->notifications()->where('id', $id)->first();
        if ($notif) $notif->markAsRead();
        return response()->json(['message' => 'OK']);
    }

    // POST /api/notifications/read-all
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'OK']);
    }
}