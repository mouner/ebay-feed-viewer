import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            w-5 h-5 rounded border-2 transition-colors flex items-center justify-center
            ${
              checked
                ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
            }
          `}
        >
          {checked && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
      </div>
      {label && (
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      )}
    </label>
  );
}
