import PanelSidebarLogo from '@/components/mydo-components/panel-sidebar-logo';
import { User } from '@/types';
import {
  AppstoreOutlined,
  DownOutlined,
  FileSearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { router, useForm } from '@inertiajs/react';
import { Avatar, Button, ConfigProvider, Dropdown, Layout, Menu, MenuProps } from 'antd';
import { LogOut } from 'lucide-react';
import { CSSProperties, PropsWithChildren, ReactNode, useCallback, useMemo, useState } from 'react';

const { Header, Sider, Content } = Layout;

const siderStyle: CSSProperties = {
  background: `
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.22), transparent 36%),
    radial-gradient(circle at bottom left, rgba(20, 83, 45, 0.24), transparent 40%),
    linear-gradient(180deg, #1f2933 0%, #263238 52%, #17212b 100%)
  `,
  borderRight: '1px solid rgba(251, 191, 36, 0.22)',
};

export default function StaffAuthLayout({
  user,
  children,
  header,
}: PropsWithChildren<{ user: User; header?: ReactNode }>) {
  const { post } = useForm();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = useCallback(() => {
    post(route('logout'));
  }, [post]);

  type MenuItem = Required<MenuProps>['items'][number];
  const navigationItems = useMemo<MenuItem[]>(
    () => [
      {
        key: 'staff.dashboard.index',
        icon: <AppstoreOutlined />,
        label: 'Dashboard',
        onClick: () => router.visit('/staff/dashboard'),
      },
      {
        key: 'staff.scholarship-applicants.index',
        icon: <FileSearchOutlined />,
        label: 'Scholarship Applicants',
        onClick: () => router.visit('/staff/applicants'),
      },
      {
        type: 'divider',
      },
      {
        key: 'staff.youth-profiles.index',
        icon: <FileSearchOutlined />,
        label: 'Youth Profiles',
        onClick: () => router.visit('/staff/youth-profiles'),
      },
      {
        key: 'logout',
        danger: true,
        icon: <LogOut size={15} />,
        label: 'Logout',
        onClick: handleLogout,
      },
    ],
    [handleLogout],
  );

  const currentRoute = `${route().current() ?? ''}`;
  const userInitials = `${user?.fname?.[0] ?? ''}${user?.lname?.[0] ?? ''}`.toUpperCase();
  const fullName = `${user?.lname ?? ''}, ${user?.fname ?? ''}`.trim();
  const compactName = `${user?.lname ?? ''}, ${user?.fname?.[0] ?? ''}.`.trim();
  const selectedMenuKey = currentRoute.startsWith('staff.applicants.') ? 'staff.applicants.index' : currentRoute;
  const pageTitle =
    currentRoute === 'staff.dashboard.index'
      ? 'Dashboard'
      : currentRoute.startsWith('staff.applicants.')
        ? 'Applicants'
        : 'Staff Panel';

  return (
    <Layout>
      <Sider
        trigger={null}
        collapsible
        style={siderStyle}
        breakpoint="md"
        onBreakpoint={(broken) => setCollapsed(broken)}
        collapsed={collapsed}
        width={260}
      >
        <div className="border-b border-amber-100/20 pb-3">
          <PanelSidebarLogo />
          {!collapsed && (
            <div className="mx-4 mt-1 rounded-lg border border-amber-100/20 bg-white/10 px-3 py-2 text-amber-50 backdrop-blur-[1px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/90">Staff Panel</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-100/35 bg-amber-200/20 text-[11px] font-semibold">
                  {userInitials || 'ST'}
                </div>
                <p className="truncate text-xs text-amber-50/90">
                  {user.lname}, {user.fname}
                </p>
              </div>
            </div>
          )}
        </div>

        <ConfigProvider
          theme={{
            token: {
              colorText: '#fff7ed',
              colorBgBase: '#263238',
              colorBgContainer: '#263238',
            },
            components: {
              Menu: {
                itemBg: 'transparent',
                itemColor: 'rgba(255,247,237,0.86)',
                itemHoverColor: '#ffffff',
                itemHoverBg: 'rgba(245, 158, 11, 0.16)',
                itemSelectedColor: '#ffffff',
                itemSelectedBg: 'rgba(22, 101, 52, 0.46)',
                subMenuItemBg: 'transparent',
                itemBorderRadius: 8,
                iconSize: 15,
              },
            },
          }}
        >
          <Menu
            mode="inline"
            style={{
              background: 'transparent',
              color: '#fff7ed',
              borderInlineEnd: 0,
              paddingInline: 8,
              paddingTop: 8,
            }}
            selectedKeys={[selectedMenuKey]}
            items={navigationItems}
          />
        </ConfigProvider>
      </Sider>

      <Layout>
        <Header className="border-b border-stone-200" style={{ padding: 0, background: 'white' }}>
          <div className="flex h-16 items-center justify-between px-3">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 42,
                  height: 42,
                }}
              />
              <div className="h-7 w-px bg-stone-200" />
              <div className="min-w-0 leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">Staff Workspace</p>
                <p className="truncate text-sm font-semibold text-stone-800">{header ?? pageTitle}</p>
              </div>
            </div>

            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'logout',
                    danger: true,
                    icon: <LogOut size={14} />,
                    label: 'Logout',
                    onClick: handleLogout,
                  },
                ],
              }}
            >
              <button
                type="button"
                className="inline-flex h-10 max-w-[210px] items-center gap-2 rounded-lg border border-stone-200 px-3 text-sm text-stone-700 hover:bg-stone-50"
                title={fullName}
              >
                <Avatar size="small" style={{ backgroundColor: '#166534' }}>
                  {userInitials || 'ST'}
                </Avatar>
                <span className="max-w-[110px] truncate font-medium lg:max-w-[160px]">{compactName}</span>
                <DownOutlined className="text-xs text-stone-500" />
              </button>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: 0,
            padding: 0,
            height: 'calc(100vh - 64px)',
            background: '#eef1ee',
            overflow: 'auto',
            borderRadius: 0,
          }}
        >
          <main className="px-4 py-8">{children}</main>
        </Content>
      </Layout>
    </Layout>
  );
}
