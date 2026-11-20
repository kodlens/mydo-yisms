<?php

namespace App\Http\Controllers\Youth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class YouthNotificationController extends Controller
{
    /**
     * Get the latest notifications and unread count for the authenticated youth.
     */
    public function index(): JsonResponse
    {
        $youth = Auth::guard('youth')->user();
        if (!$youth) {
            return response()->json(['unread_count' => 0, 'notifications' => []], 401);
        }

        $unreadCount = $youth->unreadNotifications()->count();
        $notifications = $youth->notifications()
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
    public function markAsRead(string $id): JsonResponse
    {
        $youth = Auth::guard('youth')->user();
        $notification = $youth?->notifications()->where('id', $id)->first();
        if ($notification && !$notification->read()) {
            $notification->markAsRead();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): JsonResponse
    {
        $youth = Auth::guard('youth')->user();
        $youth?->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }
}
