import { Input } from 'antd';
import { LucideIcon } from 'lucide-react';

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
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        prefix={Icon ? <Icon className="h-4 w-4 text-slate-400" /> : undefined}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
