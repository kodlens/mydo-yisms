import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { Avatar } from 'antd';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar src={user.avatar} className="bg-neutral-200 text-neutral-900">
                {getInitials(user.name)}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
            </div>
        </>
    );
}
