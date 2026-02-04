import React, { useState, useEffect } from 'react';
import { useFilterStore } from '../../stores/filterStore';
import { useProductStore } from '../../stores/productStore';

export function PriceFilter() {
  const { priceRange, priceType, setPriceRange, setPriceType } = useFilterStore();
  const products = useProductStore((state) => state.products);

  // Calculate min/max prices from products
  const { minPrice, maxPrice } = React.useMemo(() => {
    if (products.length === 0) return { minPrice: 0, maxPrice: 1000 };
    const prices = products.map((p) =>
      priceType === 'retail' ? p.price : p.wholesalePrice
    );
    const validPrices = prices.filter((p) => p > 0);
    if (validPrices.length === 0) return { minPrice: 0, maxPrice: 1000 };
    return {
      minPrice: Math.floor(Math.min(...validPrices)),
      maxPrice: Math.ceil(Math.max(...validPrices)),
    };
  }, [products, priceType]);

  const [localMin, setLocalMin] = useState(priceRange.min);
  const [localMax, setLocalMax] = useState(priceRange.max);

  useEffect(() => {
    setLocalMin(priceRange.min);
    setLocalMax(priceRange.max);
  }, [priceRange]);

  const handleMinChange = (value: number) => {
    setLocalMin(value);
  };

  const handleMaxChange = (value: number) => {
    setLocalMax(value);
  };

  const handleBlur = () => {
    const min = Math.max(0, Math.min(localMin, localMax));
    const max = Math.max(localMin, localMax);
    setPriceRange({ min, max });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Price Range
      </label>

      {/* Price Type Toggle */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
        <button
          onClick={() => setPriceType('wholesale')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            priceType === 'wholesale'
              ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Wholesale
        </button>
        <button
          onClick={() => setPriceType('retail')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            priceType === 'retail'
              ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Retail
        </button>
      </div>

      {/* Price Range Inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="sr-only">Minimum Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              £
            </span>
            <input
              type="number"
              min={0}
              value={localMin}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              onBlur={handleBlur}
              className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Min"
            />
          </div>
        </div>
        <span className="text-gray-400">—</span>
        <div className="flex-1">
          <label className="sr-only">Maximum Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              £
            </span>
            <input
              type="number"
              min={0}
              value={localMax}
              onChange={(e) => handleMaxChange(Number(e.target.value))}
              onBlur={handleBlur}
              className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Range Slider */}
      <div className="pt-2">
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={localMin}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value <= localMax) {
              setLocalMin(value);
              setPriceRange({ min: value, max: localMax });
            }
          }}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={localMax}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= localMin) {
              setLocalMax(value);
              setPriceRange({ min: localMin, max: value });
            }
          }}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 -mt-2"
        />
      </div>
    </div>
  );
}
