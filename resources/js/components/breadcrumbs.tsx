import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { Breadcrumb } from 'antd';

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
    if (breadcrumbs.length === 0) {
        return null;
    }

    return (
        <Breadcrumb
            items={breadcrumbs.map((item, index) => ({
                title:
                    index === breadcrumbs.length - 1 ? (
                        item.title
                    ) : (
                        <Link href={item.href} prefetch>
                            {item.title}
                        </Link>
                    ),
            }))}
        />
    );
}
