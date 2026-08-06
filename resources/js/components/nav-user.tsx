import { UserInfo } from '@/components/user-info';
import { useUserMenuItems } from '@/components/user-menu-content';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Button, Dropdown } from 'antd';
import { ChevronsUpDown } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const items = useUserMenuItems(auth.user);

    return (
        <Dropdown menu={{ items }} trigger={['click']} placement="topLeft">
            <Button type="text" className="flex h-auto w-full items-center justify-between px-3 py-2">
                <span className="min-w-0 flex-1">
                    <UserInfo user={auth.user} />
                </span>
                <ChevronsUpDown className="h-4 w-4 text-neutral-500" />
            </Button>
        </Dropdown>
    );
}
