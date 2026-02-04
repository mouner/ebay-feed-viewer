export interface ProductFeedItem {
  sku: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  images: string[];
  category: string;
  colour: string;
  categoryOne: string;
  categoryTwo: string;
  psin: string;
}

export interface StockFeedItem {
  sku: string;
  stockQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  price: number;
  wholesalePrice: number;
}

export interface Product extends ProductFeedItem {
  stockQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  price: number;
  wholesalePrice: number;
  hasVariations: boolean;
  variationGroup?: string;
}

export interface FilterState {
  stockStatus: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  priceRange: { min: number; max: number };
  priceType: 'retail' | 'wholesale';
  categories: string[];
  categoryOnes: string[];
  categoryTwos: string[];
  colors: string[];
  variations: 'all' | 'with_variations' | 'without_variations';
  searchQuery: string;
  sortBy: 'title' | 'price' | 'stock' | 'sku';
  sortOrder: 'asc' | 'desc';
}

export interface DashboardStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  averagePrice: number;
  totalInventoryValue: number;
}

export type ViewMode = 'grid' | 'table';

export interface PriceCalculation {
  markupPercent: number;
  ebayFeePercent: number;
  paypalFeePercent: number;
  paypalFixedFee: number;
  sellingPrice: number;
  profit: number;
  roi: number;
}
