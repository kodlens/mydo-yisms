import echo from '@/echo';
import { router, usePage } from '@inertiajs/react';
import { App, Badge, Empty, Popover, Spin } from 'antd';
import axios from 'axios';
import { Bell, CheckCheck, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface YouthAppNotification {
  id: string;
  read: boolean;
  data: {
    type?: string;
    application_id?: number;
    scholarship_type_id?: number;
    scholarship_name?: string;
    status?: string;
    rejection_reason?: string;
    title?: string;
    message?: string;
    url?: string;
    updated_at?: string;
    [key: string]: any;
  };
  created_at: string;
  timestamp?: string;
}

export default function YouthNotificationBell() {
  const { auth } = usePage<any>().props;
  const currentUserId = auth?.user?.id;

  const { notification: antdNotification } = App.useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<YouthAppNotification[]>([]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ unread_count: number; notifications: YouthAppNotification[] }>(
        route('youth.notifications.index')
      );
      setUnreadCount(res.data.unread_count ?? 0);
      setNotifications(res.data.notifications ?? []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!currentUserId) return;

    const channelName = `youth-notifications.${currentUserId}`;
    const channel = echo.channel(channelName);

    channel.listen('.scholarship.status.updated', (event: any) => {
      // 1. Ant design toast
      const isApproved = event.status === 'approved';
      if (isApproved) {
        antdNotification.success({
          message: event.title || 'Scholarship Approved!',
          description: event.description,
          placement: 'topRight',
          duration: 8,
        });
      } else {
        antdNotification.warning({
          message: event.title || 'Scholarship Status Update',
          description: event.description,
          placement: 'topRight',
          duration: 8,
        });
      }

      // 2. Increment unread count
      setUnreadCount((c) => c + 1);

      // 3. Prepend notification
      setNotifications((prev) => [
        {
          id: event.id || String(Date.now()),
          read: false,
          data: {
            type: 'scholarship_status',
            application_id: event.application_id,
            scholarship_type_id: event.scholarship_type_id,
            scholarship_name: event.scholarship_name,
            status: event.status,
            rejection_reason: event.rejection_reason,
            title: event.title,
            message: event.description,
            url: event.url,
            updated_at: event.updated_at,
          },
          created_at: 'Just now',
          timestamp: event.updated_at,
        },
        ...prev,
      ]);
    });

    return () => {
      echo.leave(channelName);
    };
  }, [currentUserId]);

  const handleNotificationClick = async (notif: YouthAppNotification) => {
    if (!notif.read) {
      try {
        await axios.post(route('youth.notifications.mark-as-read', notif.id));
        setNotifications((prev) =>
          prev.map((item) => (item.id === notif.id ? { ...item, read: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Continue
      }
    }

    setOpen(false);

    if (notif.data?.url) {
      router.visit(notif.data.url);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post(route('youth.notifications.mark-all-read'));
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const content = (
    <section
      aria-label="Notifications"
      className="w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-xl bg-white text-slate-800"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 bg-slate-50/50">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
          <p className="text-xs text-slate-500" aria-live="polite">
            {unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[min(380px,65dvh)] overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Spin size="small" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-xs text-slate-400">No notifications yet</span>}
            />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((item) => {
              const isApproved = item.data?.status === 'approved';
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                    className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 ${
                      item.read ? 'bg-white' : 'bg-teal-50/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 rounded-lg p-2 shrink-0 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <GraduationCap size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.data?.title || 'Scholarship Update'}
                        </span>
                        {!item.read && (
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 shrink-0 rounded-full bg-teal-600"
                          />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.data?.message}
                      </p>
                      <span className="mt-1.5 block text-[11px] text-slate-400">
                        {item.created_at}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={(ow) => setOpen(ow)}
      styles={{ container: { padding: 0 } }}
    >
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition focus-visible:outline-2 focus-visible:outline-teal-700"
      >
        <Badge count={unreadCount} size="small" offset={[2, -2]}>
          <Bell size={18} />
        </Badge>
      </button>
    </Popover>
  );
}
