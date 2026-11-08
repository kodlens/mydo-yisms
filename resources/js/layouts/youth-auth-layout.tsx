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
  ChevronDown,
  GraduationCap,
  HandHeart,
  House,
  LogOut,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

const { Header, Sider, Content } = Layout;

const sidebarBackground = 'linear-gradient(180deg, #04242e 0%, #073441 45%, #031b22 100%)';

type Destination = {
  key: string;
  prefix?: string;
  label: string;
  icon: typeof House;
  matches?: (current: string) => boolean;
};

const destinations: Destination[] = [
  { key: 'youth.youth-dashboard.index', prefix: 'youth.youth-dashboard.', label: 'Dashboard', icon: House },
  { key: 'youth.youth-services.events-activities.index', prefix: 'youth.youth-services.events-activities.', label: 'Events & Activities', icon: CalendarDays },
  {
    key: 'youth.services.youth-scholarships.index',
    prefix: 'youth.services.youth-scholarships.',
    label: 'Scholarships',
    icon: GraduationCap,
    matches: (route: string) =>
      route.startsWith('youth.services.youth-scholarships.') ||
      route.startsWith('youth.services.apply-scholarship.'),
  },
  { key: 'youth.youth-my-profile.index', prefix: 'youth.youth-my-profile.', label: 'My Profile', icon: UserRound },
];

export default function YouthAuthLayout({
  user,
  children,
  header,
}: PropsWithChildren<{ user: Youth; header?: ReactNode }>) {
  const { post, processing } = useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;

  const currentRoute = String(route().current() ?? '');
  const currentItem = destinations.find((item) => {
    if (item.matches) return item.matches(currentRoute);
    if (item.prefix) return currentRoute.startsWith(item.prefix);
    return currentRoute === item.key;
  });

  const pageTitle = currentItem?.label ?? 'Youth Portal';
  const initials = `${user?.fname?.[0] ?? ''}${user?.lname?.[0] ?? ''}`.toUpperCase();
  const fullName = [user?.fname, user?.lname].filter(Boolean).join(' ') || 'Youth Member';
  const logout = () => post(route('youth-logout'));

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
              itemColor: '#cffafe',
              itemHoverColor: '#ffffff',
              itemHoverBg: 'rgba(255, 255, 255, 0.09)',
              itemSelectedColor: '#ffffff',
              itemSelectedBg: '#0e7490',
              itemBorderRadius: 10,
              itemHeight: 46,
              itemMarginInline: 8,
              iconSize: 18,
              collapsedWidth: 80,
            },
          },
          token: { colorTextDisabled: '#67e8f9/40' },
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
                  <span className="rounded-xs bg-cyan-400 px-1 py-0.2 text-[9px] font-extrabold text-cyan-950 uppercase tracking-wide">
                    YOUTH
                  </span>
                </div>
                <p className="truncate text-[11px] font-medium text-cyan-200/90">Youth Portal</p>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav aria-label="Youth navigation" className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
            {!compact && (
              <p className="mb-2.5 px-3 text-[10px] font-bold tracking-widest text-cyan-300/60 uppercase">
                Youth Services
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

          {/* Bottom Youth Member Profile Card */}
          <div className="shrink-0 border-t border-white/10 p-3 bg-black/25">
            {!compact ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
                <Link
                  href={route('youth.youth-my-profile.index')}
                  className="flex items-center gap-2.5 min-w-0 flex-1 group"
                >
                  <Avatar
                    size="default"
                    className="!bg-teal-600 font-bold text-white shrink-0 shadow-xs ring-2 ring-cyan-400/30 group-hover:ring-cyan-300 transition"
                  >
                    {initials || 'Y'}
                  </Avatar>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-xs font-bold text-white group-hover:text-cyan-200 transition">
                      {fullName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {user?.reference_code ? (
                        <span className="truncate font-mono text-[9px] font-semibold text-cyan-300 bg-cyan-950/70 px-1.5 py-0.2 rounded border border-cyan-500/30">
                          {user.reference_code}
                        </span>
                      ) : (
                        <p className="truncate text-[10px] text-cyan-300/80 font-medium">Youth Member</p>
                      )}
                    </div>
                  </div>
                </Link>

                <Tooltip title="Log Out">
                  <button
                    type="button"
                    onClick={logout}
                    disabled={processing}
                    aria-label="Log Out"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 transition"
                  >
                    <LogOut size={15} />
                  </button>
                </Tooltip>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Tooltip title={`My Profile (${fullName})`}>
                  <Link href={route('youth.youth-my-profile.index')}>
                    <Avatar
                      size="small"
                      className="!bg-teal-600 font-bold text-white shadow-xs ring-2 ring-cyan-400/30 hover:ring-cyan-300 transition"
                    >
                      {initials || 'Y'}
                    </Avatar>
                  </Link>
                </Tooltip>
                <Tooltip title="Log Out">
                  <button
                    type="button"
                    onClick={logout}
                    disabled={processing}
                    aria-label="Log Out"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 transition"
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
          width={264}
          collapsedWidth={80}
          style={{
            background: sidebarBackground,
            borderRight: '1px solid rgba(6, 182, 212, 0.2)',
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
            <span className="font-bold text-slate-800 text-sm">eKabataan Youth Navigation</span>
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
                  <p className="text-[10px] font-bold tracking-widest text-cyan-800 uppercase">
                    Youth Portal
                  </p>
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  <span className="text-[11px] font-medium text-slate-500">eKabataan</span>
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
                        <div className="py-1 px-1">
                          <p className="text-xs font-bold text-slate-800">{fullName}</p>
                          {user?.reference_code && (
                            <p className="font-mono text-[10px] text-cyan-700 font-semibold mt-0.5">
                              REF: {user.reference_code}
                            </p>
                          )}
                        </div>
                      ),
                    },
                    { type: 'divider' },
                    {
                      key: 'profile',
                      icon: <UserRound size={16} />,
                      label: <Link href={route('youth.youth-my-profile.index')}>My Profile</Link>,
                    },
                    {
                      key: 'activities',
                      icon: <CalendarDays size={16} />,
                      label: (
                        <Link href={route('youth.youth-services.events-activities.index')}>
                          My Events & Activities
                        </Link>
                      ),
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
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition shadow-xs sm:px-3"
                >
                  <Avatar size="small" className="!bg-teal-600 font-bold text-white">
                    {initials || 'Y'}
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <span className="block max-w-36 truncate text-xs font-semibold text-slate-800 leading-tight">
                      {fullName}
                    </span>
                    {user?.reference_code && (
                      <span className="block font-mono text-[9px] text-cyan-700 font-bold leading-none mt-0.5">
                        {user.reference_code}
                      </span>
                    )}
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
          <main className="px-4 py-8 max-w-7xl mx-auto">{children}</main>
        </Content>
      </Layout>
    </Layout>
  );
}
