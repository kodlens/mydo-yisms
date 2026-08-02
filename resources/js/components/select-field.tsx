import { Label } from "./ui/label";

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
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        name={id}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 md:text-sm"
        disabled={disabled || loading}
        onChange={(event) => onChange?.(event.target.value)}
        value={value}
      >
        <option value="" disabled>
          {loading ? 'Loading...' : placeholder ?? `Select ${label.toLowerCase()}`}
        </option>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : helperText && <p className="text-xs leading-5 text-slate-500">{helperText}</p>}
    </div>
  );
}
