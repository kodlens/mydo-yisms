import BrandLogo from '@/components/brand-logo';
import MydoLogo from '@/components/mydo-logo';
import { User } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { Avatar, Button, ConfigProvider, Drawer, Dropdown, Grid, Layout, Menu, MenuProps, Tooltip } from 'antd';
import {
  ChartBarStacked,
  ChevronDown,
  ClipboardList,
  Coins,
  Gauge,
  GraduationCap,
  LogOut,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

const { Header, Sider, Content } = Layout;
const sidebarBackground = 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0b1120 100%)';
const destinations = [
  { key: 'admin.dashboard.index', prefix: 'admin.dashboard.', label: 'Dashboard', icon: Gauge },
  { key: 'admin.activity-categories.index', prefix: 'admin.activity-categories.', label: 'Activity Categories', icon: ChartBarStacked },
  { key: 'admin.scholarship-types.index', prefix: 'admin.scholarship-types.', label: 'Scholarships', icon: GraduationCap },
  { key: 'admin.applicants.index', prefix: 'admin.applicants.', label: 'Scholarship Applicants', icon: ClipboardList },
  { key: 'admin.cash-incentives.index', prefix: 'admin.cash-incentives.', label: 'Cash Incentives', icon: Coins },
  { key: 'admin.youth-profiles.index', prefix: 'admin.youth-profiles.', label: 'Youth Profiles', icon: Users },
  { key: 'admin.users.index', prefix: 'admin.users.', label: 'Users', icon: UserCog },
];

export default function AdminAuthLayout({ user, children, header }: PropsWithChildren<{ user: User; header?: ReactNode }>) {
  const { post, processing } = useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;
  const currentRoute = String(route().current() ?? '');
  const currentItem = destinations.find((item) => currentRoute.startsWith(item.prefix));
  const initials = `${user?.fname?.[0] ?? ''}${user?.lname?.[0] ?? ''}`.toUpperCase();
  const fullName = [user?.fname, user?.lname].filter(Boolean).join(' ') || 'Administrator';
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
          className="inline-flex w-full items-center font-medium !text-inherit hover:!text-inherit"
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
              itemColor: '#cbd5e1',
              itemHoverColor: '#ffffff',
              itemHoverBg: 'rgba(255, 255, 255, 0.08)',
              itemSelectedColor: '#ffffff',
              itemSelectedBg: '#d97706',
              itemBorderRadius: 10,
              itemHeight: 46,
              itemMarginInline: 8,
              iconSize: 18,
              collapsedWidth: 80,
            },
          },
          token: { colorTextDisabled: 'rgba(148, 163, 184, 0.4)' },
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
                  <span className="rounded-xs bg-amber-400 px-1 py-0.2 text-[9px] font-bold text-amber-950 uppercase shadow-2xs">
                    ADMIN
                  </span>
                </div>
                <p className="flex items-center gap-1 truncate text-[11px] text-amber-200/90 font-medium">
                  <ShieldCheck size={11} className="text-amber-400 shrink-0" />
                  <span>Executive Console</span>
                </p>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav aria-label="Admin navigation" className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
            {!compact && (
              <p className="mb-2.5 px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Management Modules
              </p>
            )}
            <Menu
              mode="inline"
              inlineCollapsed={compact}
              selectedKeys={currentItem ? [currentItem.key] : []}
              items={navigationItems}
              className="admin-sidebar-menu"
              style={{ background: 'transparent', borderInlineEnd: 0 }}
            />
          </nav>

          {/* Bottom Admin Profile Card */}
          <div className="shrink-0 border-t border-white/10 p-3 bg-black/25">
            {!compact ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    size="default"
                    className="!bg-amber-600 font-bold text-white shrink-0 shadow-2xs ring-2 ring-amber-400/30"
                  >
                    {initials || 'A'}
                  </Avatar>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-xs font-bold text-white">{fullName}</p>
                    <p className="truncate text-[10px] text-amber-200/90">Administrator</p>
                  </div>
                </div>

                <Tooltip title="Log Out">
                  <button
                    type="button"
                    onClick={logout}
                    disabled={processing}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 transition"
                    aria-label="Log Out"
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
                    aria-label="Log Out"
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
    <Layout
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        ['--sidebar-width' as string]: isMobile ? '0px' : collapsed ? '80px' : '264px',
      }}
    >
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={264}
          collapsedWidth={80}
          style={{
            background: sidebarBackground,
            borderRight: '1px solid rgba(251,191,36,0.15)',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1001,
          }}
        >
          {sidebar(collapsed)}
        </Sider>
      )}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white p-0.5 shadow-2xs ring-1 ring-stone-200">
              <MydoLogo className="h-7 w-7 rounded-full" label="MYDO Seal" />
            </div>
            <span className="text-sm font-bold text-stone-800">Admin Navigation</span>
          </div>
        }
        placement="left"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{
          wrapper: { width: 'min(310px, 90vw)' },
          header: { background: '#ffffff', borderBottom: '1px solid #e2e8f0' },
          body: { padding: 0, background: sidebarBackground, overflow: 'hidden' },
        }}
      >
        {sidebar(false)}
      </Drawer>
      <Layout style={{ minHeight: 0, minWidth: 0 }}>
        <Header className="border-b border-stone-200" style={{ padding: 0, background: 'white' }}>
          <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="text"
                aria-label={isMobile ? 'Open navigation' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={isMobile ? drawerOpen : !collapsed}
                icon={isMobile ? <MenuIcon size={20} /> : collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed))}
                style={{ width: 42, height: 42, flexShrink: 0 }}
              />
              <div className="min-w-0 leading-tight">
                <p className="hidden text-[10px] font-semibold tracking-widest text-stone-500 uppercase sm:block">Admin Workspace</p>
                <p className="truncate text-sm font-semibold text-stone-800">{header ?? currentItem?.label ?? 'Admin Panel'}</p>
              </div>
            </div>
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
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
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-stone-200 px-2 text-sm text-stone-700 hover:bg-stone-50 sm:px-3"
              >
                <Avatar size="small" className="!bg-amber-600 font-bold text-white">
                  {initials || 'A'}
                </Avatar>
                <span className="hidden max-w-40 truncate font-medium sm:block">{fullName}</span>
                <ChevronDown size={14} />
              </button>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 0, padding: 0, flex: 1, minHeight: 0, background: '#eef1ee', overflow: 'auto' }}>
          <main className="px-4 py-8">{children}</main>
        </Content>
      </Layout>
    </Layout>
  );
}
