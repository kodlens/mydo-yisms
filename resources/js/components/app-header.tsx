import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { UserInfo } from '@/components/user-info';
import { useUserMenuItems } from '@/components/user-menu-content';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Button, Drawer, Dropdown, Menu, Tooltip, type MenuProps } from 'antd';
import { BookOpen, Folder, LayoutGrid, Menu as MenuIcon, Search } from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const userMenuItems = useUserMenuItems(auth.user);
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems: MenuProps['items'] = mainNavItems.map((item) => ({
        key: item.url,
        icon: item.icon ? <item.icon className="h-4 w-4" /> : undefined,
        label: (
            <Link href={item.url} prefetch>
                {item.title}
            </Link>
        ),
    }));

    return (
        <>
            <header className="border-b border-neutral-200 bg-white">
                <div className="mx-auto flex h-16 items-center gap-4 px-4 md:max-w-7xl">
                    <Button type="text" icon={<MenuIcon className="h-5 w-5" />} className="lg:hidden" onClick={() => setMobileOpen(true)} />

                    <Link href="/dashboard" prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    <Menu mode="horizontal" selectedKeys={[page.url]} items={menuItems} className="hidden min-w-0 flex-1 border-none lg:flex" />

                    <div className="ml-auto flex items-center gap-1">
                        <Button type="text" icon={<Search className="h-5 w-5" />} aria-label="Search" />

                        <div className="hidden items-center gap-1 lg:flex">
                            {rightNavItems.map((item) => (
                                <Tooltip key={item.title} title={item.title}>
                                    <Button
                                        type="text"
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        icon={item.icon ? <Icon iconNode={item.icon} className="h-5 w-5" /> : undefined}
                                        aria-label={item.title}
                                    />
                                </Tooltip>
                            ))}
                        </div>

                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                            <Button type="text" className="flex h-auto items-center px-2 py-1">
                                <UserInfo user={auth.user} />
                            </Button>
                        </Dropdown>
                    </div>
                </div>
            </header>

            {breadcrumbs.length > 1 && (
                <div className="border-b border-neutral-200 bg-white">
                    <div className="mx-auto flex h-12 items-center px-4 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}

            <Drawer title="Navigation" placement="left" open={mobileOpen} onClose={() => setMobileOpen(false)} width={288}>
                <Menu mode="inline" selectedKeys={[page.url]} items={menuItems} className="border-none" />
            </Drawer>
        </>
    );
}
