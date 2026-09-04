import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { StudentSidebar } from '@/components/student-sidebar';
import { StudentSidebarHeader } from '@/components/student-sidebar-header';
import { type BreadcrumbItem } from '@/types';

export default function StudentSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <AppShell variant="sidebar">
            <StudentSidebar />
            <AppContent variant="sidebar">
                <StudentSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
