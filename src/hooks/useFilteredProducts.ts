import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Product } from '../types';
import { useProductStore } from '../stores/productStore';
import { useFilterStore } from '../stores/filterStore';

const fuseOptions = {
  keys: ['sku', 'title', 'shortDescription', 'longDescription'],
  threshold: 0.3,
  ignoreLocation: true,
  includeScore: true,
};

export function useFilteredProducts(): Product[] {
  const products = useProductStore((state) => state.products);
  const filters = useFilterStore();

  return useMemo(() => {
    let filtered = [...products];

    // Stock status filter
    if (filters.stockStatus !== 'all') {
      filtered = filtered.filter((p) => p.stockStatus === filters.stockStatus);
    }

    // Price range filter
    filtered = filtered.filter((p) => {
      const price = filters.priceType === 'retail' ? p.price : p.wholesalePrice;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Category filters
    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) =>
        filters.categories.includes(p.category)
      );
    }

    if (filters.categoryOnes.length > 0) {
      filtered = filtered.filter((p) =>
        filters.categoryOnes.includes(p.categoryOne)
      );
    }

    if (filters.categoryTwos.length > 0) {
      filtered = filtered.filter((p) =>
        filters.categoryTwos.includes(p.categoryTwo)
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter((p) =>
        filters.colors.includes(p.colour.toLowerCase())
      );
    }

    // Variations filter
    if (filters.variations === 'with_variations') {
      filtered = filtered.filter((p) => p.hasVariations);
    } else if (filters.variations === 'without_variations') {
      filtered = filtered.filter((p) => !p.hasVariations);
    }

    // Search filter (fuzzy)
    if (filters.searchQuery.trim()) {
      const fuse = new Fuse(filtered, fuseOptions);
      const results = fuse.search(filters.searchQuery.trim());
      filtered = results.map((r) => r.item);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          const priceA = filters.priceType === 'retail' ? a.price : a.wholesalePrice;
          const priceB = filters.priceType === 'retail' ? b.price : b.wholesalePrice;
          comparison = priceA - priceB;
          break;
        case 'stock':
          comparison = a.stockQuantity - b.stockQuantity;
          break;
        case 'sku':
          comparison = a.sku.localeCompare(b.sku);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [products, filters]);
}

export function useProductStats() {
  const products = useFilteredProducts();

  return useMemo(() => {
    const inStock = products.filter((p) => p.stockStatus === 'in_stock').length;
    const lowStock = products.filter((p) => p.stockStatus === 'low_stock').length;
    const outOfStock = products.filter((p) => p.stockStatus === 'out_of_stock').length;

    const prices = products.map((p) => p.price).filter((p) => p > 0);
    const averagePrice =
      prices.length > 0
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length
        : 0;

    const totalInventoryValue = products.reduce((sum, p) => {
      return sum + p.wholesalePrice * p.stockQuantity;
    }, 0);

    return {
      totalProducts: products.length,
      inStock,
      lowStock,
      outOfStock,
      averagePrice: Math.round(averagePrice * 100) / 100,
      totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
    };
  }, [products]);
}
