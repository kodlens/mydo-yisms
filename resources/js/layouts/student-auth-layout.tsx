import { useCallback, useMemo, useState, PropsWithChildren, ReactNode } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Student } from '@/types';

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  UserOutlined, LockOutlined, DownOutlined
} from '@ant-design/icons';

import { Avatar, Button, ConfigProvider, Dropdown, Layout, Menu, MenuProps } from 'antd';
import { Activity,  LogOut } from 'lucide-react';
import PanelSidebarLogo from '@/components/mydo-components/panel-sidebar-logo';


const { Header, Sider, Content } = Layout;

const siderStyle: React.CSSProperties = {
  background: `
    radial-gradient(circle at top right, rgba(34, 211, 238, 0.24), transparent 42%),
    radial-gradient(circle at bottom left, rgba(20, 184, 166, 0.18), transparent 38%),
    linear-gradient(180deg, #0f3e57 0%, #0a2f45 48%, #07293d 100%)
  `,
  borderRight: '1px solid rgba(148, 210, 228, 0.22)',
};

export default function StudentAuthLayout(
  { user, children, header }: PropsWithChildren<{ user: Student, header?: ReactNode }>) {

  const { post } = useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(['student.materials']);

  const handleLogout = useCallback(() => {
    post(route('student-logout'));
  }, [post]);

  type MenuItem = Required<MenuProps>['items'][number];
  const navigationItems = useMemo<MenuItem[]>(() => ([
    {
        key: 'encoder.dashboard.index',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => router.visit('/student/dashboard')
    },


    // {
    //     key: 'encoder.materials',
    //     icon: <FormOutlined />,
    //     label: 'Materials',
    //     children: [
    //       {
    //         key: 'encoder.materials.index',
    //         icon: <WalletCards size={15}/>,
    //         label: 'Materials',
    //         onClick: () => router.visit('/encoder/materials'),
    //       },

    //       {
    //         key: 'encoder.new-material-create.index',
    //         label: 'New Post/Material',
    //         icon: <Plus size={15}/>,
    //         onClick: () => router.visit('/encoder/new-material/create'),
    //       },

    //     ],
    // },
    {
      type: 'divider'
    },
    // {
    //     key: 'reports',
    //     icon: <UserOutlined />,
    //     label: 'Reports',
    //     children: [
    //       {
    //         key: 'reports.material-encoding',
    //         icon: <BookCheck size={15}/>,
    //         label: 'Materials Encoding Report',
    //         onClick: () => router.visit('/reports/material-encoding'),
    //       },
    //       {
    //         key: 'reports.material-publish',
    //         icon: <SquarePen size={15}/>,
    //         label: 'Activities Report',
    //         onClick: () => router.visit('/reports/material-publish'),
    //       },
    //     ],
    // },

    {
        key: 'student.my-account.index',
        icon: <UserOutlined />,
        label: 'My Account',
        onClick: () => router.visit('/student/my-account')

    },
    {
        key: 'change-password.index',
        icon: <LockOutlined />,
        label: 'Change Password',
        onClick: () => router.visit('/student/change-password')

    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      danger: true,
      icon: <LogOut size={15} />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ]), [handleLogout]);

  const currentRoute = `${route().current() ?? ''}`;
  const selectedMenuKey = currentRoute.startsWith('encoder.materials.')
    ? (currentRoute === 'encoder.materials.index' || currentRoute === 'encoder.materials.create'
      ? currentRoute
      : 'encoder.materials.index')
    : currentRoute;
  const userInitials = `${user?.fname?.[0] ?? ''}${user?.lname?.[0] ?? ''}`.toUpperCase();
  const fullName = `${user?.lname ?? ''}, ${user?.fname ?? ''}`.trim();
  const compactName = `${user?.lname ?? ''}, ${user?.fname?.[0] ?? ''}.`.trim();
  const pageTitle = currentRoute === 'encoder.dashboard.index'
    ? 'Dashboard'
    : currentRoute.startsWith('encoder.materials')
      ? 'Materials'
      : currentRoute === 'my-account.index'
        ? 'My Account'
        : currentRoute === 'change-password.index'
          ? 'Change Password'
          : 'Student Panel';


  return (

    <>
      <Layout>
        <Sider trigger={null} collapsible
          style={siderStyle}
          breakpoint='md'
          onBreakpoint={(broken) => {
            setCollapsed(broken);
            if (!broken) setOpenKeys(['encoder.materials']);
          }}
          collapsed={collapsed} width={260}>
          <div className='border-b border-cyan-100/20 pb-3'>
            <PanelSidebarLogo />
            {!collapsed && (
              <div className='mx-4 mt-1 rounded-xl border border-cyan-100/20 bg-white/10 px-3 py-2 text-cyan-50 backdrop-blur-[1px]'>
                <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/90'>Student PANEL</p>
                <div className='mt-1 flex items-center gap-2'>
                  <div className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-cyan-100/35 bg-cyan-200/20 text-[11px] font-semibold'>
                    {userInitials || 'EN'}
                  </div>
                  <p className='truncate text-xs text-cyan-50/90'>{user.lname}, {user.fname}</p>
                </div>
              </div>
            )}
          </div>
          <ConfigProvider theme={{
            token: {
              colorText: '#e6f7ff',
              colorBgBase: '#0f3e57',
              colorBgContainer: '#0f3e57',
            },
            components: {
              Menu: {
                itemBg: 'transparent',
                itemColor: 'rgba(230,247,255,0.86)',
                itemHoverColor: '#ffffff',
                itemHoverBg: 'rgba(103, 232, 249, 0.16)',
                itemSelectedColor: '#ffffff',
                itemSelectedBg: 'rgba(20, 184, 166, 0.34)',
                subMenuItemBg: 'transparent',
                itemBorderRadius: 10,
                iconSize: 15,
              },
            }
          }}>
            <Menu
              mode="inline"
              style={{
                background: 'transparent',
                color: '#e6f7ff',
                borderInlineEnd: 0,
                paddingInline: 8,
                paddingTop: 8,
              }}
              selectedKeys={[selectedMenuKey]}
              openKeys={collapsed ? [] : openKeys}
              defaultOpenKeys={['student.materials']}
              onOpenChange={(keys) => setOpenKeys(keys as string[])}
              items={navigationItems}
            />

          </ConfigProvider>
        </Sider>
        <Layout>
          <Header
            className='border-b border-slate-200'
            style={{ padding: 0, background: 'white' }}
          >
            <div className='flex h-16 items-center justify-between px-3'>
              <div className='flex items-center gap-3'>
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
                <div className='h-7 w-px bg-slate-200' />
                <div className='leading-tight'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500'>Student Workspace</p>
                  <p className='text-sm font-semibold text-slate-800'>{header ?? pageTitle}</p>
                </div>
              </div>

              <div className='flex items-center'>
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
                    type='button'
                    className='inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 hover:bg-slate-50'
                    title={fullName}
                  >
                    <Avatar size="small" style={{ backgroundColor: '#0f766e' }}>{userInitials || 'EN'}</Avatar>
                    <span className='max-w-[140px] truncate font-medium lg:max-w-[190px]'>{compactName}</span>
                    <DownOutlined className='text-xs text-slate-500' />
                  </button>
                </Dropdown>
              </div>

            </div>
          </Header>
          <Content
            style={{
              margin: 0,
              padding: 0,
              height: 'calc(100vh - 64px)',
              background: "#dce6ec",
              overflow: 'auto',
              borderRadius: 0,
            }}
          >
            <main className='py-8 px-4'>{children}</main>
          </Content>
        </Layout>
      </Layout>
    </>


  );
}
