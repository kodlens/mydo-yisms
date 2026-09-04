import { PropsWithChildren } from 'react';

export default function AuthLayout({
  children,
  title,
  description,
}: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
