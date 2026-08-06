import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { Card, Typography } from 'antd';

export default function AuthCardLayout({
    children,
    title,
    description,
}: {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}) {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link href={route('home')} className="flex items-center gap-2 self-center font-medium">
                    <div className="flex h-9 w-9 items-center justify-center">
                        <AppLogoIcon className="size-9 fill-current text-black dark:text-white" />
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl">
                        <div className="px-4 pt-2 text-center">
                            <Typography.Title level={3} className="!mb-1 !text-xl">
                                {title}
                            </Typography.Title>
                            {description && <Typography.Text type="secondary">{description}</Typography.Text>}
                        </div>
                        <div className="px-4 py-6">{children}</div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
