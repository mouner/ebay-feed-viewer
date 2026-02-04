import { Package, CheckCircle, AlertTriangle, XCircle, DollarSign, TrendingUp } from 'lucide-react';
import { useProductStats } from '../../hooks/useFilteredProducts';

export function DashboardStats() {
  const stats = useProductStats();

  const statItems = [
    {
      label: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'In Stock',
      value: stats.inStock.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Low Stock',
      value: stats.lowStock.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Out of Stock',
      value: stats.outOfStock.toLocaleString(),
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
  ];

  if (stats.totalProducts === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Dashboard
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${item.bg}`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.label}
              </span>
            </div>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Avg. Price
            </span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            £{stats.averagePrice.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Inventory Value
            </span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            £{stats.totalInventoryValue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
