import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Pre-configured Aosom feed URLs
export const DEFAULT_PRODUCT_FEED_URL = 'https://feed.aosomcdn.com/390/200_feed/0/0/51/056920.txt';
export const DEFAULT_STOCK_FEED_URL = 'https://feed.aosomcdn.com/390/200_feed/0/0/4e/c4857d.csv';

interface SettingsState {
  productFeedUrl: string;
  stockFeedUrl: string;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  syncError: string | null;

  // Actions
  setProductFeedUrl: (url: string) => void;
  setStockFeedUrl: (url: string) => void;
  setLastSyncedAt: (timestamp: number | null) => void;
  setSyncing: (isSyncing: boolean) => void;
  setSyncError: (error: string | null) => void;
  resetUrls: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      productFeedUrl: DEFAULT_PRODUCT_FEED_URL,
      stockFeedUrl: DEFAULT_STOCK_FEED_URL,
      lastSyncedAt: null,
      isSyncing: false,
      syncError: null,

      setProductFeedUrl: (url) => set({ productFeedUrl: url }),
      setStockFeedUrl: (url) => set({ stockFeedUrl: url }),
      setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
      setSyncing: (isSyncing) => set({ isSyncing }),
      setSyncError: (error) => set({ syncError: error }),
      resetUrls: () => set({
        productFeedUrl: DEFAULT_PRODUCT_FEED_URL,
        stockFeedUrl: DEFAULT_STOCK_FEED_URL,
      }),
    }),
    {
      name: 'ebay-feed-viewer-settings',
      partialize: (state) => ({
        productFeedUrl: state.productFeedUrl,
        stockFeedUrl: state.stockFeedUrl,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// Helper function to format "time ago" string
export function formatTimeAgo(timestamp: number | null): string {
  if (!timestamp) return 'Never';

  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
