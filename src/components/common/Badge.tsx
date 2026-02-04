import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full stock-badge';

  const variantStyles = {
    success:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    default:
      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StockBadge({ status }: { status: 'in_stock' | 'low_stock' | 'out_of_stock' }) {
  const config = {
    in_stock: { variant: 'success' as const, label: 'In Stock' },
    low_stock: { variant: 'warning' as const, label: 'Low Stock' },
    out_of_stock: { variant: 'danger' as const, label: 'Out of Stock' },
  };

  const { variant, label } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
