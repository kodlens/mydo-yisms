<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffNotificationController extends Controller
{
    /**
     * Get the latest notifications and unread count for the authenticated staff.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['unread_count' => 0, 'notifications' => []], 401);
        }

        $unreadCount = $user->unreadNotifications()->count();
        $notifications = $user->notifications()
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($n) {
                return [
                    'id' => $n->id,
                    'read' => $n->read(),
                    'data' => $n->data,
                    'created_at' => $n->created_at?->diffForHumans() ?? 'Just now',
                    'timestamp' => $n->created_at?->toIso8601String(),
                ];
            });

        return response()->json([
            'unread_count' => $unreadCount,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()?->notifications()->where('id', $id)->first();
        if ($notification && !$notification->read()) {
            $notification->markAsRead();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()?->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }
}
