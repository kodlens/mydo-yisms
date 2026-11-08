import BrandLogo from '@/components/brand-logo';
import MydoLogo from '@/components/mydo-logo';
import { User } from '@/types';
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
  CalendarRange,
  ChevronDown,
  Coins,
  FileSearch,
  Gauge,
  GraduationCap,
  HandHeart,
  LogOut,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

const { Header, Sider, Content } = Layout;

const sidebarBackground = 'linear-gradient(180deg, #052c20 0%, #073829 45%, #031b14 100%)';

/**
 * One entry per page in the staff panel. `prefix` matches every route in that
 * section, so a detail page like staff.applicants.show still highlights its
 * parent entry instead of falling back to nothing.
 */
const destinations = [
  { key: 'staff.dashboard.index', prefix: 'staff.dashboard.', label: 'Dashboard', icon: Gauge },
  { key: 'staff.scholarships.index', prefix: 'staff.scholarships.', label: 'Scholarships', icon: GraduationCap },
  { key: 'staff.scholarship-applicants.index', prefix: 'staff.scholarship-applicants.', label: 'Scholarship Applicants', icon: FileSearch },
  { key: 'staff.cash-incentives.index', prefix: 'staff.cash-incentives.', label: 'Cash Incentives', icon: Coins },
  { key: 'staff.events-activities.index', prefix: 'staff.events-activities.', label: 'Events & Activities', icon: CalendarRange },
  { key: 'staff.volunteers.index', prefix: 'staff.volunteers.', label: 'Volunteers', icon: HandHeart },
  { key: 'staff.youth-profiles.index', prefix: 'staff.youth-profiles.', label: 'Youth Profiles', icon: UserRound },
];

export default function StaffAuthLayout({ user, children, header }: PropsWithChildren<{ user: User; header?: ReactNode }>) {
  const { post, processing } = useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;

  const currentRoute = String(route().current() ?? '');
  const currentItem = destinations.find((item) => currentRoute.startsWith(item.prefix));

  const initials = `${user?.fname?.[0] ?? ''}${user?.lname?.[0] ?? ''}`.toUpperCase();
  const fullName = [user?.fname, user?.lname].filter(Boolean).join(' ') || 'Staff';
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
              itemColor: '#d1fae5',
              itemHoverColor: '#ffffff',
              itemHoverBg: 'rgba(255, 255, 255, 0.09)',
              itemSelectedColor: '#ffffff',
              itemSelectedBg: '#059669',
              itemBorderRadius: 10,
              itemHeight: 46,
              itemMarginInline: 8,
              iconSize: 18,
              collapsedWidth: 80,
            },
          },
          token: { colorTextDisabled: '#6ee7b7/40' },
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          {/* Header Brand Lockup */}
          <div className={`flex h-20 shrink-0 items-center gap-3 border-b border-white/10 ${compact ? 'justify-center' : 'px-5'}`}>
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
                  <span className="rounded-xs bg-emerald-400 px-1 py-0.2 text-[9px] font-bold text-emerald-950 uppercase">
                    YIMS
                  </span>
                </div>
                <p className="truncate text-[11px] text-emerald-200">Staff Workspace</p>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav aria-label="Staff navigation" className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
            {!compact && (
              <p className="mb-2.5 px-3 text-[10px] font-bold tracking-widest text-emerald-300/60 uppercase">
                Portal Modules
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

          {/* Bottom Staff Profile Card */}
          <div className="shrink-0 border-t border-white/10 p-3 bg-black/20">
            {!compact ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    size="default"
                    className="!bg-emerald-600 font-bold text-white shrink-0 shadow-2xs ring-2 ring-emerald-400/30"
                  >
                    {initials || 'S'}
                  </Avatar>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-xs font-bold text-white">{fullName}</p>
                    <p className="truncate text-[10px] text-emerald-300">MYDO Staff Officer</p>
                  </div>
                </div>

                <Tooltip title="Log Out">
                  <button
                    type="button"
                    onClick={logout}
                    disabled={processing}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 transition"
                  >
                    <LogOut size={15} />
                  </button>
                </Tooltip>
              </div>
            ) : (
              <div className="text-center">
                <Tooltip title={`Log Out (${fullName})`}>
                  <button
                    type="button"
                    onClick={logout}
                    disabled={processing}
                    className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 transition"
                  >
                    <LogOut size={17} />
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
            borderRight: '1px solid rgba(4, 120, 87, 0.25)',
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
          <div className="flex items-center gap-2">
            <MydoLogo className="h-7 w-7 rounded-full bg-white p-0.5" />
            <span className="text-sm font-bold text-slate-900">Staff Navigation</span>
          </div>
        }
        placement="left"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{
          wrapper: { width: 'min(300px, 85vw)' },
          header: { background: '#ffffff', borderBottom: '1px solid #e2e8f0' },
          body: { padding: 0, background: sidebarBackground, overflow: 'hidden' },
        }}
      >
        {sidebar(false)}
      </Drawer>

      <Layout style={{ minHeight: 0, minWidth: 0 }}>
        {/* Top Header Bar */}
        <Header className="border-b border-slate-200" style={{ padding: 0, background: 'white' }}>
          <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="text"
                aria-label={isMobile ? 'Open navigation' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={isMobile ? drawerOpen : !collapsed}
                icon={isMobile ? <MenuIcon size={20} /> : collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed))}
                style={{ width: 42, height: 42, flexShrink: 0 }}
                className="hover:!bg-slate-100"
              />

              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-2">
                  <span className="hidden text-[10px] font-bold tracking-wider text-emerald-800 uppercase sm:inline-block bg-emerald-50 px-2 py-0.5 rounded-md">
                    Staff Workspace
                  </span>
                  <span className="hidden text-slate-300 sm:inline">•</span>
                  <p className="truncate text-sm font-bold text-slate-900">
                    {header ?? currentItem?.label ?? 'Staff Panel'}
                  </p>
                </div>
              </div>
            </div>

            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: 'profile-info',
                    label: (
                      <div className="py-1">
                        <p className="text-xs font-bold text-slate-900">{fullName}</p>
                        <p className="text-[11px] text-slate-500">Staff Member</p>
                      </div>
                    ),
                    disabled: true,
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
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 shadow-2xs transition hover:bg-slate-50 sm:px-3"
              >
                <Avatar
                  size="small"
                  className="!bg-emerald-700 font-bold text-white shadow-xs"
                >
                  {initials || 'S'}
                </Avatar>
                <span className="hidden max-w-40 truncate font-semibold sm:block text-xs text-slate-800">
                  {fullName}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </Dropdown>
          </div>
        </Header>

        {/* Content Area */}
        <Content style={{ margin: 0, padding: 0, flex: 1, minHeight: 0, background: '#f8faf8', overflow: 'auto' }}>
          <main className="px-4 py-8 lg:px-8">{children}</main>
        </Content>
      </Layout>
    </Layout>
  );
}
