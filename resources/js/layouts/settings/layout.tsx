import { PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
  return <div className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">{children}</div>;
}
