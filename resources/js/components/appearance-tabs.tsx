import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { Segmented } from 'antd';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <Segmented
            className={className}
            value={appearance}
            onChange={(value) => updateAppearance(value as Appearance)}
            options={tabs.map(({ value, icon: Icon, label }) => ({
                value,
                label: (
                    <span className="inline-flex items-center gap-1.5">
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                    </span>
                ),
            }))}
            {...props}
        />
    );
}
