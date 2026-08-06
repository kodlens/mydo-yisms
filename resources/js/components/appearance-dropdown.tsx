import { useAppearance } from '@/hooks/use-appearance';
import { Button, Dropdown, type MenuProps } from 'antd';
import { Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="h-5 w-5" />;
            case 'light':
                return <Sun className="h-5 w-5" />;
            default:
                return <Monitor className="h-5 w-5" />;
        }
    };

    const items: MenuProps['items'] = [
        {
            key: 'light',
            icon: <Sun className="h-4 w-4" />,
            label: 'Light',
            onClick: () => updateAppearance('light'),
        },
        {
            key: 'dark',
            icon: <Moon className="h-4 w-4" />,
            label: 'Dark',
            onClick: () => updateAppearance('dark'),
        },
        {
            key: 'system',
            icon: <Monitor className="h-4 w-4" />,
            label: 'System',
            onClick: () => updateAppearance('system'),
        },
    ];

    return (
        <div className={className} {...props}>
            <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
                <Button type="text" icon={getCurrentIcon()} aria-label="Toggle theme" />
            </Dropdown>
        </div>
    );
}
