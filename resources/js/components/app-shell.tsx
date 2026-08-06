import { createContext, useContext, useMemo, useState } from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

type SidebarState = {
    open: boolean;
    setOpen: (open: boolean) => void;
    toggle: () => void;
};

const SidebarContext = createContext<SidebarState | null>(null);

export function useAppSidebar() {
    const context = useContext(SidebarContext);

    if (!context) {
        throw new Error('useAppSidebar must be used inside AppShell.');
    }

    return context;
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const [isOpen, setIsOpen] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('sidebar') !== 'false' : true));

    const handleSidebarChange = (open: boolean) => {
        setIsOpen(open);

        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar', String(open));
        }
    };

    const sidebar = useMemo(
        () => ({
            open: isOpen,
            setOpen: handleSidebarChange,
            toggle: () => handleSidebarChange(!isOpen),
        }),
        [isOpen],
    );

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return (
        <SidebarContext.Provider value={sidebar}>
            <div className="flex min-h-screen w-full bg-neutral-50 text-neutral-950">{children}</div>
        </SidebarContext.Provider>
    );
}
