import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { type MenuProps } from 'antd';
import { LogOut, Settings } from 'lucide-react';

export function useUserMenuItems(user: User): MenuProps['items'] {
    const cleanup = useMobileNavigation();

    return [
        {
            key: 'user',
            disabled: true,
            label: (
                <div className="min-w-48 py-1">
                    <UserInfo user={user} showEmail />
                </div>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: 'settings',
            icon: <Settings className="h-4 w-4" />,
            label: (
                <Link href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                    Settings
                </Link>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogOut className="h-4 w-4" />,
            label: (
                <Link method="post" href={route('logout')} as="button" onClick={cleanup}>
                    Log out
                </Link>
            ),
        },
    ];
}
