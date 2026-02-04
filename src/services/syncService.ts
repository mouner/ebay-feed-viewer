import { parseProductFeed, parseStockFeed, type ParseProgress } from './feedParser';
import { mergeFeeds, calculateStats } from './dataMerger';
import type { Product, DashboardStats } from '../types';

export interface SyncProgress {
  stage: 'fetching-products' | 'parsing-products' | 'fetching-stock' | 'parsing-stock' | 'merging' | 'complete';
  percent: number;
  message: string;
}

export interface SyncResult {
  products: Product[];
  stats: DashboardStats;
  productCount: number;
  stockCount: number;
}

export async function syncFeeds(
  productUrl: string,
  stockUrl: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> {
  // Fetch product feed
  onProgress?.({
    stage: 'fetching-products',
    percent: 0,
    message: 'Fetching product feed...',
  });

  const productResponse = await fetch(productUrl);
  if (!productResponse.ok) {
    throw new Error(`Failed to fetch product feed: ${productResponse.statusText}`);
  }
  const productContent = await productResponse.text();

  // Parse product feed
  onProgress?.({
    stage: 'parsing-products',
    percent: 20,
    message: 'Parsing product feed...',
  });

  const productFeed = await parseProductFeed(productContent, (progress: ParseProgress) => {
    onProgress?.({
      stage: 'parsing-products',
      percent: 20 + (progress.percent * 0.2),
      message: `Parsing products: ${Math.round(progress.percent)}%`,
    });
  });

  // Fetch stock feed
  onProgress?.({
    stage: 'fetching-stock',
    percent: 40,
    message: 'Fetching stock feed...',
  });

  const stockResponse = await fetch(stockUrl);
  if (!stockResponse.ok) {
    throw new Error(`Failed to fetch stock feed: ${stockResponse.statusText}`);
  }
  const stockContent = await stockResponse.text();

  // Parse stock feed
  onProgress?.({
    stage: 'parsing-stock',
    percent: 60,
    message: 'Parsing stock feed...',
  });

  const stockFeed = await parseStockFeed(stockContent, (progress: ParseProgress) => {
    onProgress?.({
      stage: 'parsing-stock',
      percent: 60 + (progress.percent * 0.2),
      message: `Parsing stock: ${Math.round(progress.percent)}%`,
    });
  });

  // Merge feeds
  onProgress?.({
    stage: 'merging',
    percent: 80,
    message: 'Merging product and stock data...',
  });

  const products = mergeFeeds(productFeed, stockFeed);
  const stats = calculateStats(products);

  onProgress?.({
    stage: 'complete',
    percent: 100,
    message: 'Sync complete!',
  });

  return {
    products,
    stats,
    productCount: productFeed.length,
    stockCount: stockFeed.length,
  };
}
