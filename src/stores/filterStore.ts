import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FilterState } from '../types';

interface FilterStoreState extends FilterState {
  // Actions
  setStockStatus: (status: FilterState['stockStatus']) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setPriceType: (type: 'retail' | 'wholesale') => void;
  setCategories: (categories: string[]) => void;
  setCategoryOnes: (categories: string[]) => void;
  setCategoryTwos: (categories: string[]) => void;
  setColors: (colors: string[]) => void;
  setVariations: (variations: FilterState['variations']) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: FilterState['sortBy']) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  resetFilters: () => void;
}

const initialFilters: FilterState = {
  stockStatus: 'all',
  priceRange: { min: 0, max: 10000 },
  priceType: 'retail',
  categories: [],
  categoryOnes: [],
  categoryTwos: [],
  colors: [],
  variations: 'all',
  searchQuery: '',
  sortBy: 'title',
  sortOrder: 'asc',
};

export const useFilterStore = create<FilterStoreState>()(
  persist(
    (set) => ({
      ...initialFilters,

      setStockStatus: (status) => set({ stockStatus: status }),

      setPriceRange: (range) => set({ priceRange: range }),

      setPriceType: (type) => set({ priceType: type }),

      setCategories: (categories) => set({ categories }),

      setCategoryOnes: (categoryOnes) => set({ categoryOnes }),

      setCategoryTwos: (categoryTwos) => set({ categoryTwos }),

      setColors: (colors) => set({ colors }),

      setVariations: (variations) => set({ variations }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSortBy: (sortBy) => set({ sortBy }),

      setSortOrder: (order) => set({ sortOrder: order }),

      resetFilters: () => set(initialFilters),
    }),
    {
      name: 'ebay-feed-viewer-filters',
      partialize: (state) => ({
        priceType: state.priceType,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
