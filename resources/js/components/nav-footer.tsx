import { type NavItem } from '@/types';
import { Button } from 'antd';

export function NavFooter({ items, className = '' }: { items: NavItem[]; className?: string }) {
    return (
        <div className={`space-y-1 px-2 ${className}`}>
            {items.map((item) => (
                <Button
                    key={item.title}
                    type="text"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={item.icon ? <item.icon className="h-4 w-4" /> : undefined}
                    className="flex w-full items-center justify-start text-neutral-600"
                >
                    {item.title}
                </Button>
            ))}
        </div>
    );
}
