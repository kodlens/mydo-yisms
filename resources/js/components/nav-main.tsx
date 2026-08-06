import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, type MenuProps } from 'antd';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    const menuItems: MenuProps['items'] = items.map((item) => ({
        key: item.url,
        icon: item.icon ? <item.icon className="h-4 w-4" /> : undefined,
        label: (
            <Link href={item.url} prefetch>
                {item.title}
            </Link>
        ),
    }));

    return (
        <div className="px-2">
            <p className="px-4 pb-2 text-xs font-semibold uppercase text-neutral-500">Platform</p>
            <Menu mode="inline" selectedKeys={[page.url]} items={menuItems} className="border-none bg-transparent" />
        </div>
    );
}
