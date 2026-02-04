import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductFeedItem, StockFeedItem, DashboardStats, ViewMode } from '../types';
import { mergeFeeds, calculateStats, getUniqueCategories } from '../services/dataMerger';

interface ProductState {
  // Data
  products: Product[];
  productFeed: ProductFeedItem[];
  stockFeed: StockFeedItem[];
  stats: DashboardStats;

  // Unique values for filters
  categories: string[];
  categoryOnes: string[];
  categoryTwos: string[];
  colors: string[];

  // UI State
  viewMode: ViewMode;
  selectedProducts: Set<string>;
  favorites: Set<string>;
  isLoading: boolean;
  loadingProgress: number;
  error: string | null;

  // Actions
  setProductFeed: (feed: ProductFeedItem[]) => void;
  setStockFeed: (feed: StockFeedItem[]) => void;
  mergeAndSetProducts: () => void;
  setViewMode: (mode: ViewMode) => void;
  toggleProductSelection: (sku: string) => void;
  selectAllProducts: (skus: string[]) => void;
  clearSelection: () => void;
  toggleFavorite: (sku: string) => void;
  setLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialStats: DashboardStats = {
  totalProducts: 0,
  inStock: 0,
  lowStock: 0,
  outOfStock: 0,
  averagePrice: 0,
  totalInventoryValue: 0,
};

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      // Initial Data
      products: [],
      productFeed: [],
      stockFeed: [],
      stats: initialStats,
      categories: [],
      categoryOnes: [],
      categoryTwos: [],
      colors: [],

      // Initial UI State
      viewMode: 'grid',
      selectedProducts: new Set(),
      favorites: new Set(),
      isLoading: false,
      loadingProgress: 0,
      error: null,

      // Actions
      setProductFeed: (feed) => set({ productFeed: feed }),

      setStockFeed: (feed) => set({ stockFeed: feed }),

      mergeAndSetProducts: () => {
        const { productFeed, stockFeed } = get();
        const products = mergeFeeds(productFeed, stockFeed);
        const stats = calculateStats(products);
        const uniqueValues = getUniqueCategories(products);

        set({
          products,
          stats,
          ...uniqueValues,
        });
      },

      setViewMode: (mode) => set({ viewMode: mode }),

      toggleProductSelection: (sku) => {
        const { selectedProducts } = get();
        const newSelection = new Set(selectedProducts);
        if (newSelection.has(sku)) {
          newSelection.delete(sku);
        } else {
          newSelection.add(sku);
        }
        set({ selectedProducts: newSelection });
      },

      selectAllProducts: (skus) => {
        set({ selectedProducts: new Set(skus) });
      },

      clearSelection: () => set({ selectedProducts: new Set() }),

      toggleFavorite: (sku) => {
        const { favorites } = get();
        const newFavorites = new Set(favorites);
        if (newFavorites.has(sku)) {
          newFavorites.delete(sku);
        } else {
          newFavorites.add(sku);
        }
        set({ favorites: newFavorites });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setLoadingProgress: (progress) => set({ loadingProgress: progress }),

      setError: (error) => set({ error }),

      reset: () => set({
        products: [],
        productFeed: [],
        stockFeed: [],
        stats: initialStats,
        categories: [],
        categoryOnes: [],
        categoryTwos: [],
        colors: [],
        selectedProducts: new Set(),
        isLoading: false,
        loadingProgress: 0,
        error: null,
      }),
    }),
    {
      name: 'ebay-feed-viewer-products',
      partialize: (state) => ({
        favorites: Array.from(state.favorites),
        viewMode: state.viewMode,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<ProductState> & { favorites?: string[] };
        return {
          ...current,
          favorites: new Set(persistedState.favorites || []),
          viewMode: persistedState.viewMode || current.viewMode,
        };
      },
    }
  )
);
