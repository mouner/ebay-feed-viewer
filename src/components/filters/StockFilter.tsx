import { useFilterStore } from '../../stores/filterStore';

export function StockFilter() {
  const { stockStatus, setStockStatus } = useFilterStore();

  const options = [
    { value: 'all', label: 'All' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock (≤10)' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ] as const;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Stock Status
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setStockStatus(option.value)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-full transition-colors
              ${
                stockStatus === option.value
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
