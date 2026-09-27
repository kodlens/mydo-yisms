import { Badge, Popover } from 'antd';
import { Bell, CalendarDays, CheckCheck, GraduationCap, UserRound } from 'lucide-react';
import { useState } from 'react';

const sampleNotifications = [
  {
    id: 1,
    title: 'A new activity to explore',
    description: 'The Youth Leadership Summit is now posted. Take a look at the activity details.',
    time: '5 minutes ago',
    icon: CalendarDays,
    read: false,
  },
  {
    id: 2,
    title: 'Scholarship announcement',
    description: 'Explore the scholarship programs available in your youth portal.',
    time: '1 hour ago',
    icon: GraduationCap,
    read: false,
  },
  {
    id: 3,
    title: 'Keep your profile up to date',
    description: 'Review your contact details so the youth office can reach you.',
    time: 'Yesterday',
    icon: UserRound,
    read: true,
  },
];

export default function YouthNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const content = (
    <section aria-label="Notifications" className="w-[min(350px,calc(100vw-32px))] overflow-hidden rounded-xl bg-white text-slate-800">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-base font-bold">Notifications</h2>
          <p className="mt-0.5 text-xs text-slate-500" aria-live="polite">
            {unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}
          </p>
        </div>
        <button
          type="button"
          disabled={!unreadCount}
          onClick={() => setNotifications((items) => items.map((item) => ({ ...item, read: true })))}
          className="inline-flex items-center gap-1.5 rounded-md p-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 disabled:cursor-default disabled:text-slate-400"
        >
          <CheckCheck size={15} /> Mark all read
        </button>
      </div>
      <ul className="max-h-[min(360px,60dvh)] overflow-y-auto">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <li key={notification.id} className="border-b border-slate-100 last:border-0">
              <button
                type="button"
                aria-label={`${notification.title}${notification.read ? ', read' : ', unread. Mark as read'}`}
                onClick={() =>
                  setNotifications((items) => items.map((item) => (item.id === notification.id ? { ...item, read: true } : item)))
                }
                className={`flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-700 ${notification.read ? 'bg-white' : 'bg-teal-50/50'}`}
              >
                <span className="rounded-lg bg-teal-100/70 p-2 text-teal-700">
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{notification.title}</span>
                    {!notification.read && <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-teal-600" />}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{notification.description}</span>
                  <span className="mt-2 block text-[11px] text-slate-400">{notification.time}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center text-[11px] text-slate-500">
        Sample notifications · For preview only
      </p>
    </section>
  );

  return (
    <Popover content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
      }}
      styles={{ container: { padding: 0 } }}
    >
      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700"
      >
        <Badge count={unreadCount} size="small" offset={[3, -2]} color="#0f766e">
          <Bell size={20} className="text-slate-600" />
        </Badge>
      </button>
    </Popover>
  );
}
