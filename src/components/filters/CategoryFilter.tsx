import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useFilterStore } from '../../stores/filterStore';
import { useProductStore } from '../../stores/productStore';
import { Checkbox } from '../common/Checkbox';

export function CategoryFilter() {
  const { categoryOnes, categoryTwos, setCategoryOnes, setCategoryTwos } = useFilterStore();
  const availableCategoryOnes = useProductStore((state) => state.categoryOnes);
  const availableCategoryTwos = useProductStore((state) => state.categoryTwos);

  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllCat1, setShowAllCat1] = useState(false);
  const [showAllCat2, setShowAllCat2] = useState(false);

  const hasCategories = availableCategoryOnes.length > 0 || availableCategoryTwos.length > 0;
  const activeFilters = categoryOnes.length + categoryTwos.length;

  if (!hasCategories) return null;

  const displayedCat1 = showAllCat1 ? availableCategoryOnes : availableCategoryOnes.slice(0, 5);
  const displayedCat2 = showAllCat2 ? availableCategoryTwos : availableCategoryTwos.slice(0, 5);

  const toggleCategoryOne = (category: string) => {
    if (categoryOnes.includes(category)) {
      setCategoryOnes(categoryOnes.filter((c) => c !== category));
    } else {
      setCategoryOnes([...categoryOnes, category]);
    }
  };

  const toggleCategoryTwo = (category: string) => {
    if (categoryTwos.includes(category)) {
      setCategoryTwos(categoryTwos.filter((c) => c !== category));
    } else {
      setCategoryTwos([...categoryTwos, category]);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span className="flex items-center gap-2">
          Categories
          {activeFilters > 0 && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              {activeFilters}
            </span>
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Category One */}
          {availableCategoryOnes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category One
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {displayedCat1.map((category) => (
                  <Checkbox
                    key={category}
                    checked={categoryOnes.includes(category)}
                    onChange={() => toggleCategoryOne(category)}
                    label={category}
                    className="py-0.5"
                  />
                ))}
              </div>
              {availableCategoryOnes.length > 5 && (
                <button
                  onClick={() => setShowAllCat1(!showAllCat1)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showAllCat1
                    ? 'Show less'
                    : `Show ${availableCategoryOnes.length - 5} more`}
                </button>
              )}
            </div>
          )}

          {/* Category Two */}
          {availableCategoryTwos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category Two
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {displayedCat2.map((category) => (
                  <Checkbox
                    key={category}
                    checked={categoryTwos.includes(category)}
                    onChange={() => toggleCategoryTwo(category)}
                    label={category}
                    className="py-0.5"
                  />
                ))}
              </div>
              {availableCategoryTwos.length > 5 && (
                <button
                  onClick={() => setShowAllCat2(!showAllCat2)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showAllCat2
                    ? 'Show less'
                    : `Show ${availableCategoryTwos.length - 5} more`}
                </button>
              )}
            </div>
          )}

          {/* Clear Categories */}
          {activeFilters > 0 && (
            <button
              onClick={() => {
                setCategoryOnes([]);
                setCategoryTwos([]);
              }}
              className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              <X className="w-3 h-3" />
              Clear categories
            </button>
          )}
        </div>
      )}
    </div>
  );
}
