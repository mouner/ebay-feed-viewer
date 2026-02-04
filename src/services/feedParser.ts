import Papa from 'papaparse';
import type { ProductFeedItem, StockFeedItem } from '../types';

// Column mapping for product feed (TSV)
const PRODUCT_COLUMN_MAPPINGS: Record<string, keyof ProductFeedItem> = {
  'sku': 'sku',
  'SKU': 'sku',
  'product_sku': 'sku',
  'title': 'title',
  'Title': 'title',
  'product_title': 'title',
  'name': 'title',
  'short_description': 'shortDescription',
  'Short Description': 'shortDescription',
  'shortDescription': 'shortDescription',
  'long_description': 'longDescription',
  'Long Description': 'longDescription',
  'longDescription': 'longDescription',
  'description': 'longDescription',
  'Description': 'longDescription',
  'images': 'images',
  'Images': 'images',
  'image_urls': 'images',
  'image': 'images',
  'Image': 'images',
  'Base image': 'images',
  'base_image': 'images',
  'category': 'category',
  'Category': 'category',
  'colour': 'colour',
  'Colour': 'colour',
  'color': 'colour',
  'Color': 'colour',
  'category_one': 'categoryOne',
  'Category One': 'categoryOne',
  'categoryOne': 'categoryOne',
  'category_1': 'categoryOne',
  'category_two': 'categoryTwo',
  'Category Two': 'categoryTwo',
  'categoryTwo': 'categoryTwo',
  'category_2': 'categoryTwo',
  'psin': 'psin',
  'Psin': 'psin',
  'PSIN': 'psin',
};

// Column mapping for stock feed (CSV)
const STOCK_COLUMN_MAPPINGS: Record<string, keyof StockFeedItem | 'stockStatus'> = {
  'sku': 'sku',
  'SKU': 'sku',
  'product_sku': 'sku',
  'stock': 'stockQuantity',
  'Stock': 'stockQuantity',
  'stock_quantity': 'stockQuantity',
  'quantity': 'stockQuantity',
  'Quantity': 'stockQuantity',
  'qty': 'stockQuantity',
  'stock_status': 'stockStatus',
  'status': 'stockStatus',
  'price': 'price',
  'Price': 'price',
  'retail_price': 'price',
  'sell_price': 'price',
  'wholesale_price': 'wholesalePrice',
  'Wholesale Price': 'wholesalePrice',
  'WholeSale Price': 'wholesalePrice',
  'wholesalePrice': 'wholesalePrice',
  'cost': 'wholesalePrice',
  'Cost': 'wholesalePrice',
};

function detectDelimiter(sample: string): string {
  const tabCount = (sample.match(/\t/g) || []).length;
  const commaCount = (sample.match(/,/g) || []).length;
  return tabCount > commaCount ? '\t' : ',';
}

function mapColumns<T>(headers: string[], mappings: Record<string, string>): Map<number, keyof T> {
  const columnMap = new Map<number, keyof T>();
  headers.forEach((header, index) => {
    const cleanHeader = header.trim();
    if (mappings[cleanHeader]) {
      columnMap.set(index, mappings[cleanHeader] as keyof T);
    }
  });
  return columnMap;
}

function parseImages(imageString: string): string[] {
  if (!imageString) return [];
  const urls = imageString.split(/[,|;\n]+/).map(url => url.trim()).filter(url => {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('http');
    }
  });
  return urls;
}

function parsePrice(priceString: string): number {
  if (!priceString) return 0;
  const cleaned = priceString.replace(/[£$€,\s]/g, '');
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}

// Parse stock value that can be either a number or text status
function parseStockValue(value: string): { quantity: number; statusText: string } {
  if (!value) return { quantity: 0, statusText: '' };
  const trimmed = value.trim();
  const lowerValue = trimmed.toLowerCase();

  // Check if it's a text status
  if (lowerValue === 'in stock') {
    return { quantity: 0, statusText: 'in_stock' };
  }
  if (lowerValue === 'out of stock' || lowerValue === 'out-of-stock') {
    return { quantity: 0, statusText: 'out_of_stock' };
  }
  if (lowerValue === 'low stock' || lowerValue === 'low-stock') {
    return { quantity: 0, statusText: 'low_stock' };
  }

  // Try to parse as number
  const num = parseInt(trimmed.replace(/[^\d-]/g, ''), 10);
  if (!isNaN(num)) {
    return { quantity: Math.max(0, num), statusText: '' };
  }

  return { quantity: 0, statusText: '' };
}

function getStockStatus(quantity: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= 10) return 'low_stock';
  return 'in_stock';
}

export interface ParseProgress {
  loaded: number;
  total: number;
  percent: number;
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function parseProductFeed(
  file: File | string,
  onProgress?: (progress: ParseProgress) => void
): Promise<ProductFeedItem[]> {
  const content = file instanceof File ? await readFileAsText(file) : file;
  const delimiter = detectDelimiter(content.slice(0, 1000));

  onProgress?.({ loaded: 0, total: 100, percent: 0 });

  const result = Papa.parse<string[]>(content, {
    delimiter,
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data;
  if (rows.length === 0) return [];

  const headers = rows[0];
  const columnMap = mapColumns<ProductFeedItem>(headers, PRODUCT_COLUMN_MAPPINGS);

  const products: ProductFeedItem[] = [];
  const totalRows = rows.length - 1;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const product: Partial<ProductFeedItem> = {};

    columnMap.forEach((field, index) => {
      const value = row[index] || '';
      if (field === 'images') {
        product.images = parseImages(value);
      } else {
        (product as Record<string, string>)[field] = value.trim();
      }
    });

    if (product.sku) {
      products.push({
        sku: product.sku || '',
        title: product.title || '',
        shortDescription: product.shortDescription || '',
        longDescription: product.longDescription || '',
        images: product.images || [],
        category: product.category || '',
        colour: product.colour || '',
        categoryOne: product.categoryOne || '',
        categoryTwo: product.categoryTwo || '',
        psin: product.psin || '',
      });
    }

    if (i % 1000 === 0) {
      onProgress?.({
        loaded: i,
        total: totalRows,
        percent: (i / totalRows) * 100,
      });
    }
  }

  onProgress?.({ loaded: totalRows, total: totalRows, percent: 100 });
  return products;
}

export async function parseStockFeed(
  file: File | string,
  onProgress?: (progress: ParseProgress) => void
): Promise<StockFeedItem[]> {
  const content = file instanceof File ? await readFileAsText(file) : file;
  const delimiter = detectDelimiter(content.slice(0, 1000));

  onProgress?.({ loaded: 0, total: 100, percent: 0 });

  const result = Papa.parse<string[]>(content, {
    delimiter,
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data;
  if (rows.length === 0) return [];

  const headers = rows[0];
  const columnMap = mapColumns<StockFeedItem>(headers, STOCK_COLUMN_MAPPINGS);

  const stockItems: StockFeedItem[] = [];
  const totalRows = rows.length - 1;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item: Partial<StockFeedItem> = {};
    let rawStockStatus = '';
    let stockValueParsed = { quantity: 0, statusText: '' };

    columnMap.forEach((field, index) => {
      const value = row[index] || '';
      if (field === 'stockQuantity') {
        // Parse stock value which can be number or text status
        stockValueParsed = parseStockValue(value);
        item.stockQuantity = stockValueParsed.quantity;
      } else if (field === 'price') {
        item.price = parsePrice(value);
      } else if (field === 'wholesalePrice') {
        item.wholesalePrice = parsePrice(value);
      } else if (field === 'stockStatus') {
        rawStockStatus = value.toLowerCase();
      } else {
        (item as Record<string, string>)[field] = value.trim();
      }
    });

    if (item.sku) {
      let stockStatus: StockFeedItem['stockStatus'];

      // Priority: 1) Explicit status column, 2) Parsed from stock value, 3) Derived from quantity
      if (rawStockStatus) {
        if (rawStockStatus.includes('out') || rawStockStatus === '0' || rawStockStatus === 'no') {
          stockStatus = 'out_of_stock';
        } else if (rawStockStatus.includes('low')) {
          stockStatus = 'low_stock';
        } else {
          stockStatus = 'in_stock';
        }
      } else if (stockValueParsed.statusText) {
        stockStatus = stockValueParsed.statusText as StockFeedItem['stockStatus'];
      } else {
        stockStatus = getStockStatus(item.stockQuantity || 0);
      }

      stockItems.push({
        sku: item.sku,
        stockQuantity: item.stockQuantity || 0,
        stockStatus,
        price: item.price || 0,
        wholesalePrice: item.wholesalePrice || 0,
      });
    }

    if (i % 1000 === 0) {
      onProgress?.({
        loaded: i,
        total: totalRows,
        percent: (i / totalRows) * 100,
      });
    }
  }

  onProgress?.({ loaded: totalRows, total: totalRows, percent: 100 });
  return stockItems;
}

export async function fetchAndParseFeed<T>(
  url: string,
  parser: (content: string, onProgress?: (progress: ParseProgress) => void) => Promise<T[]>,
  onProgress?: (progress: ParseProgress) => void
): Promise<T[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`);
  }
  const content = await response.text();
  return parser(content, onProgress);
}
