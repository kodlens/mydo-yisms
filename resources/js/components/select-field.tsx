import { Select } from 'antd';

type SelectOption = string | { value: string | number; label: string };

export default function SelectField({
  disabled = false,
  error,
  helperText,
  id,
  label,
  loading = false,
  onChange,
  options,
  placeholder,
  value,
}: {
  disabled?: boolean;
  error?: string;
  helperText?: string;
  id: string;
  label: string;
  loading?: boolean;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <Select
        id={id}
        className="w-full"
        disabled={disabled || loading}
        loading={loading}
        onChange={(selectedValue) => onChange?.(selectedValue)}
        options={options.map((option) => ({
          value: String(typeof option === 'string' ? option : option.value),
          label: typeof option === 'string' ? option : option.label,
        }))}
        placeholder={loading ? 'Loading...' : placeholder ?? `Select ${label.toLowerCase()}`}
        value={value || undefined}
      />
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : helperText && <p className="text-xs leading-5 text-slate-500">{helperText}</p>}
    </div>
  );
}
