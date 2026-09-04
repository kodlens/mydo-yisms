import { Breadcrumbs } from '@/components/breadcrumbs';
import { StudentSidebar } from '@/components/student-sidebar';
import { useAppSidebar } from '@/components/app-shell';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Button, Drawer } from 'antd';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function StudentSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { toggle } = useAppSidebar();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-neutral-200 px-4 md:px-6">
            <div className="flex items-center gap-2">
                <Button type="text" icon={<Menu className="h-5 w-5" />} onClick={toggle} className="hidden lg:inline-flex" aria-label="Toggle sidebar" />
                <Button type="text" icon={<Menu className="h-5 w-5" />} onClick={() => setMobileOpen(true)} className="lg:hidden" aria-label="Open menu" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <Drawer title="Student Navigation" placement="left" open={mobileOpen} onClose={() => setMobileOpen(false)} width={288}>
                <StudentSidebar mobile />
            </Drawer>
        </header>
    );
}
