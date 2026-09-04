import { BreadcrumbItem } from '@/types';
import { PropsWithChildren } from 'react';

export default function AppLayout({
  children,
  breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  const currentPage = breadcrumbs.at(-1)?.title ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4">
          <p className="text-sm font-semibold text-neutral-800">{currentPage}</p>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
