import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { useAppSidebar } from '@/components/app-shell';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Button } from 'antd';
import { FileText, GraduationCap, LayoutGrid, UserRound } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/student/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Profile',
        url: '/student/profile',
        icon: UserRound,
    },
    {
        title: 'Scholarship',
        url: '/student/scholarship',
        icon: GraduationCap,
    },
    {
        title: 'Documents',
        url: '/student/documents',
        icon: FileText,
    },
];

const footerNavItems: NavItem[] = [];

export function StudentSidebar({ mobile = false }: { mobile?: boolean }) {
    const { open } = useAppSidebar();

    return (
        <aside
            className={
                mobile
                    ? 'flex h-full w-full flex-col bg-white'
                    : `${open ? 'w-64' : 'w-0'} hidden shrink-0 overflow-hidden border-r border-neutral-200 bg-white transition-all lg:flex lg:flex-col`
            }
        >
            <div className="p-3">
                <Button type="text" className="flex h-auto w-full justify-start p-2">
                    <Link href="/student/dashboard" prefetch>
                        <AppLogo />
                    </Link>
                </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-2">
                <NavMain items={mainNavItems} />
            </div>

            <div className="space-y-2 border-t border-neutral-200 p-3">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </div>
        </aside>
    );
}
