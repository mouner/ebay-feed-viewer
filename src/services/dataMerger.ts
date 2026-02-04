import type { ProductFeedItem, StockFeedItem, Product, DashboardStats } from '../types';

export function mergeFeeds(
  products: ProductFeedItem[],
  stock: StockFeedItem[]
): Product[] {
  // Create a map of stock items by SKU for efficient lookup
  const stockMap = new Map<string, StockFeedItem>();
  stock.forEach(item => {
    stockMap.set(item.sku.toLowerCase(), item);
  });

  // Detect variations by checking for similar SKUs
  const skuGroups = new Map<string, string[]>();
  products.forEach(product => {
    // Extract base SKU (remove variation suffixes like -BLK, -RED, etc.)
    const baseSku = product.sku.replace(/[-_]([A-Z]{2,4}|[0-9]+)$/i, '');
    if (!skuGroups.has(baseSku)) {
      skuGroups.set(baseSku, []);
    }
    skuGroups.get(baseSku)!.push(product.sku);
  });

  // Determine which products have variations
  const variationGroups = new Map<string, string>();
  skuGroups.forEach((skus, baseSku) => {
    if (skus.length > 1) {
      skus.forEach(sku => {
        variationGroups.set(sku, baseSku);
      });
    }
  });

  // Merge product and stock data
  return products.map(product => {
    const stockItem = stockMap.get(product.sku.toLowerCase());
    const hasVariations = variationGroups.has(product.sku);

    return {
      ...product,
      stockQuantity: stockItem?.stockQuantity ?? 0,
      stockStatus: stockItem?.stockStatus ?? 'out_of_stock',
      price: stockItem?.price ?? 0,
      wholesalePrice: stockItem?.wholesalePrice ?? 0,
      hasVariations,
      variationGroup: variationGroups.get(product.sku),
    };
  });
}

export function calculateStats(products: Product[]): DashboardStats {
  const inStock = products.filter(p => p.stockStatus === 'in_stock').length;
  const lowStock = products.filter(p => p.stockStatus === 'low_stock').length;
  const outOfStock = products.filter(p => p.stockStatus === 'out_of_stock').length;

  const prices = products.map(p => p.price).filter(p => p > 0);
  const averagePrice = prices.length > 0
    ? prices.reduce((sum, p) => sum + p, 0) / prices.length
    : 0;

  const totalInventoryValue = products.reduce((sum, p) => {
    return sum + (p.wholesalePrice * p.stockQuantity);
  }, 0);

  return {
    totalProducts: products.length,
    inStock,
    lowStock,
    outOfStock,
    averagePrice: Math.round(averagePrice * 100) / 100,
    totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
  };
}

export function getUniqueCategories(products: Product[]): {
  categories: string[];
  categoryOnes: string[];
  categoryTwos: string[];
  colors: string[];
} {
  const categories = new Set<string>();
  const categoryOnes = new Set<string>();
  const categoryTwos = new Set<string>();
  const colors = new Set<string>();

  products.forEach(product => {
    if (product.category) categories.add(product.category);
    if (product.categoryOne) categoryOnes.add(product.categoryOne);
    if (product.categoryTwo) categoryTwos.add(product.categoryTwo);
    if (product.colour) {
      // Normalize color names
      const normalizedColor = product.colour.trim().toLowerCase();
      if (normalizedColor) colors.add(normalizedColor);
    }
  });

  return {
    categories: Array.from(categories).sort(),
    categoryOnes: Array.from(categoryOnes).sort(),
    categoryTwos: Array.from(categoryTwos).sort(),
    colors: Array.from(colors).sort(),
  };
}
