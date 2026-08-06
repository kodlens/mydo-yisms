import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export default function FormSection({ children, icon: Icon, title }: { children: ReactNode; icon: LucideIcon; title: string }) {
  return (
    <div
      className="mb-6 border border-slate-200 p-4 rounded-md"
    >
      <span className="inline-flex items-center gap-3 mb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-bold">{title}</span>
      </span>
      {children}
    </div>
  );
}
