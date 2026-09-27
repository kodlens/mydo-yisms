import { User } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { Avatar, Button, ConfigProvider, Drawer, Dropdown, Grid, Layout, Menu, MenuProps, Tooltip } from 'antd';
import {
  ChartBarStacked,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  House,
  LogOut,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

const { Header, Sider, Content } = Layout;
const sidebarBackground = 'linear-gradient(180deg, #1f2933 0%, #263238 52%, #17212b 100%)';
const destinations = [
  { key: 'admin.dashboard.index', prefix: 'admin.dashboard.', label: 'Dashboard', icon: House },
  { key: 'admin.activity-categories.index', prefix: 'admin.activity-categories.', label: 'Activity Categories', icon: ChartBarStacked },
  { key: 'admin.scholarship-types.index', prefix: 'admin.scholarship-types.', label: 'Scholarship Types', icon: GraduationCap },
  { key: 'admin.applicants.index', prefix: 'admin.applicants.', label: 'Scholarship Applicants', icon: ClipboardList },
  { key: 'admin.youth-profiles.index', prefix: 'admin.youth-profiles.', label: 'Youth Profiles', icon: Users },
  { key: 'admin.users.index', prefix: 'admin.users.', label: 'Users', icon: UserRound },
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
      icon: <Icon size={18} />,
      label: available ? (
        <Link href={route(key)} aria-current={currentItem?.key === key ? 'page' : undefined} onClick={() => setDrawerOpen(false)}>
          {label}
        </Link>
      ) : (
        <Tooltip title="Not available yet">
          <span>{label}</span>
        </Tooltip>
      ),
    };
  });
  const accountItems: MenuProps['items'] = [{ key: 'logout', icon: <LogOut size={18} />, label: 'Logout', disabled: processing, onClick: logout }];

  function sidebar(compact: boolean) {
    return (
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemBg: 'transparent',
              itemColor: '#e2e8e5',
              itemHoverColor: '#ffffff',
              itemHoverBg: 'rgba(255,255,255,0.07)',
              itemSelectedColor: '#ffffff',
              itemSelectedBg: '#166534',
              itemBorderRadius: 10,
              itemHeight: 46,
              itemMarginInline: 0,
              iconSize: 18,
              collapsedWidth: 80,
            },
          },
          token: { colorTextDisabled: '#84908c' },
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className={`flex h-20 shrink-0 items-center gap-3 border-b border-white/10 ${compact ? 'justify-center' : 'px-5'}`}>
            <img src="/images/e-kabataan.png" alt="E-Kabataan logo" className="h-10 w-10 shrink-0 object-contain" />
            {!compact && (
              <div>
                <p className="text-sm font-bold tracking-wide text-white">E-KABATAAN</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-200">
                  <ShieldCheck size={13} /> Administration
                </p>
              </div>
            )}
          </div>
          <nav aria-label="Admin navigation" className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
            {!compact && <p className="mb-3 px-3 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Workspace</p>}
            <Menu
              mode="inline"
              inlineCollapsed={compact}
              selectedKeys={currentItem ? [currentItem.key] : []}
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
            borderRight: '1px solid rgba(251,191,36,0.15)',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {sidebar(collapsed)}
        </Sider>
      )}
      <Drawer
        title="Admin navigation"
        placement="left"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{
          wrapper: { width: 'min(310px, 90vw)' },
          header: { background: '#ffffff' },
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
                <Avatar size="small" style={{ backgroundColor: '#166534' }}>
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
