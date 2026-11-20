import echo from '@/echo';
import { router } from '@inertiajs/react';
import { App, Badge, Empty, Popover, Spin } from 'antd';
import axios from 'axios';
import { Bell, CheckCheck, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface AppNotification {
  id: string;
  read: boolean;
  data: {
    type?: string;
    application_id?: number;
    youth_profile_id?: number;
    applicant_name?: string;
    scholarship_name?: string;
    reference?: string;
    title?: string;
    message?: string;
    url?: string;
    submitted_at?: string;
    [key: string]: any;
  };
  created_at: string;
  timestamp?: string;
}

export default function StaffNotificationBell() {
  const { notification: antdNotification } = App.useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ unread_count: number; notifications: AppNotification[] }>(
        route('staff.notifications.index')
      );
      setUnreadCount(res.data.unread_count ?? 0);
      setNotifications(res.data.notifications ?? []);
    } catch {
      // Ignore network errors on polling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const channel = echo.channel('staff-notifications');

    channel.listen('.scholarship.application.submitted', (event: any) => {
      // 1. Real-time floating toast
      antdNotification.info({
        message: event.title || 'New Scholarship Application',
        description: event.description || `${event.applicant_name} applied for ${event.scholarship_name}.`,
        placement: 'topRight',
        duration: 8,
      });

      // 2. Increment unread count
      setUnreadCount((count) => count + 1);

      // 3. Add to notifications list
      setNotifications((prev) => [
        {
          id: event.id || String(Date.now()),
          read: false,
          data: {
            type: 'scholarship_application',
            application_id: event.application_id,
            youth_profile_id: event.youth_profile_id,
            applicant_name: event.applicant_name,
            scholarship_name: event.scholarship_name,
            reference: event.reference,
            title: event.title || 'New Scholarship Application',
            message: event.description || `${event.applicant_name} applied for ${event.scholarship_name}.`,
            url: event.url,
            submitted_at: event.submitted_at,
          },
          created_at: 'Just now',
          timestamp: event.submitted_at,
        },
        ...prev,
      ]);
    });

    return () => {
      echo.leave('staff-notifications');
    };
  }, []);

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      try {
        await axios.post(route('staff.notifications.mark-as-read', notif.id));
        setNotifications((prev) =>
          prev.map((item) => (item.id === notif.id ? { ...item, read: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Continue navigation regardless
      }
    }

    setOpen(false);

    if (notif.data?.url) {
      router.visit(notif.data.url);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post(route('staff.notifications.mark-all-read'));
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const content = (
    <section
      aria-label="Staff Notifications"
      className="w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-xl bg-white text-slate-800"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 bg-slate-50/50">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
          <p className="text-xs text-slate-500" aria-live="polite">
            {unreadCount ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
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
            {notifications.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 ${
                    item.read ? 'bg-white' : 'bg-emerald-50/40'
                  }`}
                >
                  <span className="mt-0.5 rounded-lg bg-emerald-100/70 p-2 text-emerald-700 shrink-0">
                    <GraduationCap size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.data?.title || 'Notification'}
                      </span>
                      {!item.read && (
                        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.data?.message}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{item.created_at}</span>
                      {item.data?.reference && (
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                          {item.data.reference}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
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
      onOpenChange={setOpen}
      styles={{ container: { padding: 0 } }}
    >
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition focus-visible:outline-2 focus-visible:outline-emerald-600"
      >
        <Badge count={unreadCount} size="small" offset={[2, -2]} color="#059669">
          <Bell size={18} />
        </Badge>
      </button>
    </Popover>
  );
}
