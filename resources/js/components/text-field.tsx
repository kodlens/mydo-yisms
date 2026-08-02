import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';
import { Input } from './ui/input';


export default function TextField({
  error,
  icon: Icon,
  id,
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  error?: string;
  icon?: LucideIcon;
  id: string;
  label: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  value?: string | number;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
        <Input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          className={Icon ? 'pl-10' : undefined}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
