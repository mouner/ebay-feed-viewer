import { ArrowUp, ArrowDown } from 'lucide-react';
import { Select } from '../common/Select';
import { useFilterStore } from '../../stores/filterStore';

export function SortControls() {
  const { sortBy, sortOrder, setSortBy, setSortOrder } = useFilterStore();

  const sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'price', label: 'Price' },
    { value: 'stock', label: 'Stock Level' },
    { value: 'sku', label: 'SKU' },
  ];

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Sort By
      </label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(value) => setSortBy(value as typeof sortBy)}
          />
        </div>
        <button
          onClick={toggleSortOrder}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortOrder === 'asc' ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
