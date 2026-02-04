import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import type { Product } from '../types';

export function exportProductsToCSV(products: Product[], filename?: string): void {
  const data = products.map(product => ({
    SKU: product.sku,
    Title: product.title,
    Category: product.category,
    'Category One': product.categoryOne,
    'Category Two': product.categoryTwo,
    Colour: product.colour,
    'Stock Status': product.stockStatus.replace('_', ' '),
    'Stock Quantity': product.stockQuantity,
    'Retail Price': product.price.toFixed(2),
    'Wholesale Price': product.wholesalePrice.toFixed(2),
    'Has Variations': product.hasVariations ? 'Yes' : 'No',
    'Image Count': product.images.length,
    'Primary Image': product.images[0] || '',
    PSIN: product.psin,
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const timestamp = new Date().toISOString().slice(0, 10);
  saveAs(blob, filename || `products_export_${timestamp}.csv`);
}
