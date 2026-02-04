import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Product } from '../types';
import { useProductStore } from '../stores/productStore';
import { useFilterStore } from '../stores/filterStore';

// Lighter fuzzy search - only SKU and title for performance
const fuseOptions = {
  keys: ['sku', 'title'],
  threshold: 0.3,
  ignoreLocation: true,
  includeScore: true,
};

// Detect if query looks like a SKU (contains dash, numbers, or uppercase pattern)
function looksLikeSKU(query: string): boolean {
  const trimmed = query.trim();
  // Contains a dash followed by alphanumeric (common SKU pattern like "83B-147V00WT")
  if (/-[A-Z0-9]/i.test(trimmed)) return true;
  // All uppercase with numbers (like "B31P012")
  if (/^[A-Z0-9-]+$/i.test(trimmed) && /\d/.test(trimmed) && trimmed.length >= 5) return true;
  return false;
}

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

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.trim();
      const queryLower = query.toLowerCase();

      // If it looks like a SKU, try exact/contains match first
      if (looksLikeSKU(query)) {
        const skuMatches = filtered.filter(p =>
          p.sku.toLowerCase().includes(queryLower)
        );
        // If we found SKU matches, use those; otherwise fall back to fuzzy
        if (skuMatches.length > 0) {
          filtered = skuMatches;
        } else {
          // Fall back to fuzzy search on SKU and title only
          const fuse = new Fuse(filtered, fuseOptions);
          const results = fuse.search(query);
          filtered = results.map((r) => r.item);
        }
      } else {
        // Regular search: check title contains, then fuzzy
        const titleMatches = filtered.filter(p =>
          p.title.toLowerCase().includes(queryLower) ||
          p.sku.toLowerCase().includes(queryLower)
        );

        if (titleMatches.length > 0 && titleMatches.length < 500) {
          // Good number of direct matches, use those
          filtered = titleMatches;
        } else {
          // Use fuzzy search for broader matching
          const fuse = new Fuse(filtered, fuseOptions);
          const results = fuse.search(query);
          filtered = results.map((r) => r.item);
        }
      }
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
