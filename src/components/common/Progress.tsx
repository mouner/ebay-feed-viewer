interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  className = '',
}: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between text-sm mb-1">
          {label && (
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          )}
          {showValue && (
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeStyles[size]}`}
      >
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
