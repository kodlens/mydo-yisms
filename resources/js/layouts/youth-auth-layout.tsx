import YouthNotificationBell from '@/components/mydo-components/youth-notification-bell';
import { Youth } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { Avatar, Button, ConfigProvider, Drawer, Dropdown, Grid, Layout, Menu, MenuProps, Tooltip } from 'antd';
import {
  CalendarDays,
  ChevronDown,
  GraduationCap,
  House,
  LockKeyhole,
  LogOut,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

const { Header, Sider, Content } = Layout;
const sidebarBackground = 'linear-gradient(180deg, #0f3e57 0%, #0a2f45 48%, #07293d 100%)';
const destinations = [
  { key: 'youth.youth-dashboard.index', label: 'Dashboard', icon: House },
  { key: 'youth.youth-services.events-activities.index', label: 'Events & Activities', icon: CalendarDays },
  { key: 'youth.services.youth-scholarships.index', label: 'Scholarships', icon: GraduationCap },
  { key: 'youth.youth-my-profile.index', label: 'My Profile', icon: UserRound },
];

export default function YouthAuthLayout({ user, children, header }: PropsWithChildren<{ user: Youth; header?: ReactNode }>) {
  const { post, processing } = useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;
  const currentRoute = String(route().current() ?? '');
  const selectedKey = currentRoute.startsWith('youth.services.apply-scholarship.') ? 'youth.services.youth-scholarships.index' : currentRoute;
  const pageTitle = destinations.find((item) => item.key === selectedKey)?.label ?? 'Youth Portal';
  const initials = `${user?.fname?.[0] ?? ''}${user?.lname?.[0] ?? ''}`.toUpperCase();
  const fullName = [user?.fname, user?.lname].filter(Boolean).join(' ');
  const logout = () => post(route('youth-logout'));

  const navigationItems: MenuProps['items'] = destinations.map(({ key, label, icon: Icon }) => ({
    key,
    icon: <Icon size={18} />,
    label: (
      <Link href={route(key)} aria-current={selectedKey === key ? 'page' : undefined} onClick={() => setDrawerOpen(false)}>
        {label}
      </Link>
    ),
  }));
  const accountItems: MenuProps['items'] = [
    // The existing password page has no youth backend route yet.
    { key: 'password', disabled: true, icon: <LockKeyhole size={18} />, label: <Tooltip title="Not available yet">Change Password</Tooltip> },
    { key: 'logout', icon: <LogOut size={18} />, label: 'Logout', disabled: processing, onClick: logout },
  ];

  function sidebar(compact: boolean) {
    return (
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemBg: 'transparent',
              itemColor: '#d7e8f0',
              itemHoverColor: '#ffffff',
              itemHoverBg: 'rgba(103, 232, 249, 0.12)',
              itemSelectedColor: '#ffffff',
              itemSelectedBg: '#126b72',
              itemBorderRadius: 10,
              itemHeight: 46,
              itemMarginInline: 0,
              iconSize: 18,
              collapsedWidth: 80,
            },
          },
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className={`flex h-20 shrink-0 items-center gap-3 border-b border-white/10 ${compact ? 'justify-center' : 'px-5'}`}>
            <img src="/images/e-kabataan.png" alt="E-Kabataan logo" className="h-10 w-10 shrink-0 object-contain" />
            {!compact && (
              <div>
                <p className="text-sm font-bold tracking-wide text-white">E-KABATAAN</p>
                <p className="mt-0.5 text-xs text-cyan-100/70">Youth Portal</p>
              </div>
            )}
          </div>
          <nav aria-label="Youth navigation" className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
            <Menu
              mode="inline"
              inlineCollapsed={compact}
              selectedKeys={[selectedKey]}
              items={navigationItems}
              style={{ background: 'transparent', borderInlineEnd: 0 }}
            />
          </nav>
          <nav aria-label="Account actions" className="shrink-0 border-t border-white/10 px-3 py-3">
            <Menu
              mode="inline"
              inlineCollapsed={compact}
              selectedKeys={[]}
              items={accountItems}
              style={{ background: 'transparent', borderInlineEnd: 0 }}
            />
          </nav>
        </div>
      </ConfigProvider>
    );
  }

  return (
    <>
      <Layout style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
        {!isMobile && (
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={248}
            collapsedWidth={80}
            style={{ background: sidebarBackground, height: '100%', minHeight: 0, overflow: 'hidden' }}
          >
            {sidebar(collapsed)}
          </Sider>
        )}
        <Drawer
          title="Youth navigation"
          placement="left"
          open={isMobile && drawerOpen}
          onClose={() => setDrawerOpen(false)}
          styles={{
            wrapper: { width: 'min(300px, 88vw)' },
            header: { background: '#ffffff' },
            body: { padding: 0, background: sidebarBackground, overflow: 'hidden' },
          }}
        >
          {sidebar(false)}
        </Drawer>
        <Layout style={{ minHeight: 0, minWidth: 0 }}>
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
                />
                <div className="min-w-0 leading-tight">
                  <p className="hidden text-[10px] font-semibold tracking-widest text-slate-500 uppercase sm:block">Youth Portal</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{header ?? pageTitle}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <YouthNotificationBell />
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      {
                        key: 'profile',
                        icon: <UserRound size={16} />,
                        label: <Link href={route('youth.youth-my-profile.index')}>My Profile</Link>,
                      },
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
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-2 text-sm text-slate-700 hover:bg-slate-50 sm:px-3"
                  >
                    <Avatar size="small" style={{ backgroundColor: '#0f766e' }}>
                      {initials || 'Y'}
                    </Avatar>
                    <span className="hidden max-w-40 truncate font-medium sm:block">{fullName}</span>
                    <ChevronDown size={14} />
                  </button>
                </Dropdown>
              </div>
            </div>
          </Header>
          <Content style={{ margin: 0, padding: 0, flex: 1, minHeight: 0, background: '#dce6ec', overflow: 'auto' }}>
            <main className="px-4 py-8">{children}</main>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
