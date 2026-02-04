import { RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';
import { StockFilter } from './StockFilter';
import { PriceFilter } from './PriceFilter';
import { CategoryFilter } from './CategoryFilter';
import { ColorFilter } from './ColorFilter';
import { VariationsFilter } from './VariationsFilter';
import { SortControls } from './SortControls';
import { useFilterStore } from '../../stores/filterStore';
import { useProductStore } from '../../stores/productStore';

export function FilterPanel() {
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const products = useProductStore((state) => state.products);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset
        </Button>
      </div>

      {/* Sort Controls */}
      <SortControls />

      {/* Stock Filter */}
      <StockFilter />

      {/* Price Filter */}
      <PriceFilter />

      {/* Variations Filter */}
      <VariationsFilter />

      {/* Category Filters */}
      <CategoryFilter />

      {/* Color Filter */}
      <ColorFilter />
    </div>
  );
}
