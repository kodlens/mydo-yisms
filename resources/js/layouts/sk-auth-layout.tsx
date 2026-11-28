import BrandLogo from '@/components/brand-logo';
import MydoLogo from '@/components/mydo-logo';
import YouthNotificationBell from '@/components/mydo-components/youth-notification-bell';
import { Youth } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import {
  Avatar,
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Grid,
  Layout,
  Menu,
  MenuProps,
  Tooltip,
} from 'antd';
import {
  CalendarDays,
  Camera,
  ChevronDown,
  House,
  LogOut,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

const { Header, Sider, Content } = Layout;

const sidebarBackground = 'linear-gradient(180deg, #1e1b4b 0%, #312e81 48%, #0f172a 100%)';

type Destination = {
  key: string;
  prefix?: string;
  label: string;
  icon: typeof House;
};

const destinations: Destination[] = [
  { key: 'sk.dashboard.index', prefix: 'sk.dashboard.', label: 'SK Dashboard', icon: House },
  {
    key: 'sk.events-activities.index',
    prefix: 'sk.events-activities.',
    label: 'Events & Evidence Upload',
    icon: Camera,
  },
];

export type SkUser = Youth & {
  sk_position?: string | null;
};

export default function SkAuthLayout({
  user,
  children,
  header,
}: PropsWithChildren<{ user: SkUser; header?: ReactNode }>) {
  const { post, processing } = useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;

  const currentRoute = String(route().current() ?? '');
  const currentItem = destinations.find((item) => {
    if (item.prefix) return currentRoute.startsWith(item.prefix);
    return currentRoute === item.key;
  });

  const pageTitle = currentItem?.label ?? 'SK Official Portal';
  const initials = `${user?.fname?.[0] ?? ''}${user?.lname?.[0] ?? ''}`.toUpperCase();
  const fullName = [user?.fname, user?.lname].filter(Boolean).join(' ') || 'SK Official';
  const skPosition = user?.sk_position || 'SK Official';
  const logout = () => post(route('logout'));

  const navigationItems: MenuProps['items'] = destinations.map(({ key, label, icon: Icon }) => {
    const available = route().has(key);

    return {
      key,
      disabled: !available,
      icon: <Icon size={18} className="shrink-0" />,
      label: available ? (
        <Link
          href={route(key)}
          aria-current={currentItem?.key === key ? 'page' : undefined}
          onClick={() => setDrawerOpen(false)}
          className="inline-flex w-full items-center font-medium"
        >
          {label}
        </Link>
      ) : (
        <Tooltip title="Not available yet">
          <span>{label}</span>
        </Tooltip>
      ),
    };
  });

  function sidebar(compact: boolean) {
    return (
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemBg: 'transparent',
              itemColor: '#e0e7ff',
              itemHoverColor: '#ffffff',
              itemHoverBg: 'rgba(255, 255, 255, 0.1)',
              itemSelectedColor: '#ffffff',
              itemSelectedBg: '#4f46e5',
              itemBorderRadius: 10,
              itemHeight: 46,
              itemMarginInline: 8,
              iconSize: 18,
              collapsedWidth: 80,
            },
          },
          token: { colorTextDisabled: 'rgba(199, 210, 254, 0.4)' },
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          {/* Header Brand Lockup */}
          <div
            className={`flex h-20 shrink-0 items-center gap-3 border-b border-white/10 ${
              compact ? 'justify-center' : 'px-5'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white p-0.5 shadow-sm ring-1 ring-white/20">
                <MydoLogo className="h-9 w-9 rounded-full" label="MYDO Seal" />
              </div>
              {!compact && (
                <>
                  <div className="h-6 w-px bg-white/20" />
                  <div className="rounded-lg bg-white/10 p-1">
                    <BrandLogo className="h-7 w-7" label="eKabataan" />
                  </div>
                </>
              )}
            </div>

            {!compact && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-black tracking-tight text-white">eKabataan</span>
                  <span className="rounded-xs bg-amber-400 px-1.5 py-0.2 text-[9px] font-extrabold tracking-wide text-indigo-950 uppercase">
                    SK PORTAL
                  </span>
                </div>
                <p className="truncate text-[11px] font-medium text-indigo-200/90">Sangguniang Kabataan</p>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav aria-label="SK Official navigation" className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
            {!compact && (
              <p className="mb-2.5 px-3 text-[10px] font-bold tracking-widest text-indigo-300/70 uppercase">
                SK Governance & Monitoring
              </p>
            )}
            <Menu
              mode="inline"
              inlineCollapsed={compact}
              selectedKeys={currentItem ? [currentItem.key] : []}
              items={navigationItems}
              style={{ background: 'transparent', borderInlineEnd: 0 }}
            />
          </nav>

          {/* Bottom SK Official Profile Card */}
          <div className="shrink-0 border-t border-white/10 bg-black/25 p-3">
            {!compact ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Avatar
                    size="default"
                    className="!bg-indigo-600 font-bold text-white shrink-0 shadow-xs ring-2 ring-amber-400/40"
                  >
                    {initials || 'SK'}
                  </Avatar>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-xs font-bold text-white">{fullName}</p>
                    <p className="truncate text-[10px] font-semibold text-amber-300 mt-0.5">{skPosition}</p>
                    {user?.barangay?.brgyDesc && (
                      <p className="truncate text-[10px] text-indigo-200/90 mt-0.5">
                        Brgy. {user.barangay.brgyDesc}
                      </p>
                    )}
                    {user?.reference_code && (
                      <span className="mt-0.5 inline-block truncate rounded border border-indigo-400/30 bg-indigo-950/70 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-indigo-200">
                        {user.reference_code}
                      </span>
                    )}
                  </div>
                </div>

                <Tooltip title="Log Out">
                  <button
                    type="button"
                    onClick={logout}
                    disabled={processing}
                    aria-label="Log Out"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-500/20 hover:text-rose-300"
                  >
                    <LogOut size={15} />
                  </button>
                </Tooltip>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Tooltip title={`${fullName} (${skPosition})`}>
                  <Avatar
                    size="small"
                    className="!bg-indigo-600 font-bold text-white shadow-xs ring-2 ring-amber-400/40"
                  >
                    {initials || 'SK'}
                  </Avatar>
                </Tooltip>
                <Tooltip title="Log Out">
                  <button
                    type="button"
                    onClick={logout}
                    disabled={processing}
                    aria-label="Log Out"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-500/20 hover:text-rose-300"
                  >
                    <LogOut size={16} />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </ConfigProvider>
    );
  }

  return (
    <Layout style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={268}
          collapsedWidth={80}
          style={{
            background: sidebarBackground,
            borderRight: '1px solid rgba(99, 102, 241, 0.25)',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {sidebar(collapsed)}
        </Sider>
      )}

      <Drawer
        title={
          <div className="flex items-center gap-2.5">
            <MydoLogo className="h-6 w-6 rounded-full" />
            <span className="text-sm font-bold text-slate-800">eKabataan SK Official Portal</span>
          </div>
        }
        placement="left"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{
          wrapper: { width: 'min(300px, 88vw)' },
          header: { background: '#ffffff', borderBottom: '1px solid #e2e8f0' },
          body: { padding: 0, background: sidebarBackground, overflow: 'hidden' },
        }}
      >
        {sidebar(false)}
      </Drawer>

      <Layout style={{ minHeight: 0, minWidth: 0 }}>
        <Header className="border-b border-slate-200/80 bg-white" style={{ padding: 0 }}>
          <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="text"
                aria-label={isMobile ? 'Open navigation' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={isMobile ? drawerOpen : !collapsed}
                icon={
                  isMobile ? (
                    <MenuIcon size={20} />
                  ) : collapsed ? (
                    <PanelLeftOpen size={20} />
                  ) : (
                    <PanelLeftClose size={20} />
                  )
                }
                onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed))}
                style={{ width: 42, height: 42, flexShrink: 0 }}
              />
              <div className="min-w-0 leading-tight">
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-indigo-800 uppercase">
                    <ShieldCheck className="h-3 w-3 text-indigo-700" />
                    SK Official Portal
                  </span>
                  <span className="h-1 w-1 rounded-full bg-indigo-400" />
                  <span className="text-[11px] font-medium text-slate-500">{skPosition}</span>
                </div>
                <p className="truncate text-sm font-bold text-slate-800">{header ?? pageTitle}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <YouthNotificationBell />
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'info',
                      disabled: true,
                      label: (
                        <div className="px-1 py-1">
                          <p className="text-xs font-bold text-slate-800">{fullName}</p>
                          <p className="text-[11px] font-semibold text-indigo-700">{skPosition}</p>
                          {user?.reference_code && (
                            <p className="mt-0.5 font-mono text-[10px] font-semibold text-slate-500">
                              REF: {user.reference_code}
                            </p>
                          )}
                        </div>
                      ),
                    },
                    { type: 'divider' },
                    {
                      key: 'dashboard',
                      icon: <House size={16} />,
                      label: <Link href={route('sk.dashboard.index')}>SK Dashboard</Link>,
                    },
                    {
                      key: 'activities',
                      icon: <CalendarDays size={16} />,
                      label: <Link href={route('sk.events-activities.index')}>Events & Evidence Upload</Link>,
                    },
                    { type: 'divider' },
                    {
                      key: 'logout',
                      icon: <LogOut size={16} />,
                      label: 'Logout',
                      danger: true,
                      disabled: processing,
                      onClick: logout,
                    },
                  ],
                }}
              >
                <button
                  type="button"
                  aria-label={`Account menu for ${fullName}`}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 sm:px-3"
                >
                  <Avatar size="small" className="!bg-indigo-700 font-bold text-white">
                    {initials || 'SK'}
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <span className="block max-w-36 truncate text-xs font-semibold leading-tight text-slate-800">
                      {fullName}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold leading-none text-indigo-700">
                      {skPosition}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
              </Dropdown>
            </div>
          </div>
        </Header>

        <Content
          style={{
            margin: 0,
            padding: 0,
            flex: 1,
            minHeight: 0,
            background: '#f1f5f9',
            overflow: 'auto',
          }}
        >
          <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        </Content>
      </Layout>
    </Layout>
  );
}
