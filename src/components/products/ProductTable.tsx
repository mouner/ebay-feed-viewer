import type { MouseEvent } from 'react';
import { useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Download,
  Copy,
  Heart,
  Check,
  ImageIcon,
  Calculator,
} from 'lucide-react';
import { StockBadge } from '../common/Badge';
import { Checkbox } from '../common/Checkbox';
import type { Product } from '../../types';
import { useProductStore } from '../../stores/productStore';
import { downloadProductImages, copyDescription } from '../../services/imageDownloader';

interface ProductTableProps {
  products: Product[];
  onImageClick: (product: Product) => void;
  onCalculatorClick: (product: Product) => void;
}

export function ProductTable({
  products,
  onImageClick,
  onCalculatorClick,
}: ProductTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { favorites, toggleFavorite, selectedProducts, toggleProductSelection, selectAllProducts, clearSelection } =
    useProductStore();
  const [downloadingSku, setDownloadingSku] = useState<string | null>(null);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  const allSelected = products.length > 0 && products.every(p => selectedProducts.has(p.sku));

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllProducts(products.map(p => p.sku));
    }
  };

  const handleDownload = async (product: Product, e: MouseEvent) => {
    e.stopPropagation();
    if (product.images.length === 0) return;
    setDownloadingSku(product.sku);
    try {
      await downloadProductImages(product);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingSku(null);
    }
  };

  const handleCopy = async (product: Product, e: MouseEvent) => {
    e.stopPropagation();
    try {
      copyDescription(product, 'html');
      setCopiedSku(product.sku);
      setTimeout(() => setCopiedSku(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No products found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Try adjusting your filters or search query
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div ref={parentRef} className="flex-1 overflow-auto">
        <table className="w-full min-w-[900px] border-collapse">
          {/* Table Header */}
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="w-10 px-2 py-3 text-left">
                <Checkbox
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="w-14 px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
                Image
              </th>
              <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
                Product
              </th>
              <th className="w-28 px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">
                SKU
              </th>
              <th className="w-16 px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                Stock
              </th>
              <th className="w-24 px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                Price
              </th>
              <th className="w-24 px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                Status
              </th>
              <th className="w-28 px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
        </table>

        {/* Virtualized Body */}
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            minWidth: '900px',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const product = products[virtualRow.index];
            const isSelected = selectedProducts.has(product.sku);
            const isFavorite = favorites.has(product.sku);
            const isDownloading = downloadingSku === product.sku;
            const isCopied = copiedSku === product.sku;

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`
                  flex items-center px-0
                  border-b border-gray-100 dark:border-gray-800
                  hover:bg-gray-50 dark:hover:bg-gray-800/50
                  ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                `}
              >
                {/* Checkbox */}
                <div className="w-10 flex-shrink-0 px-2">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleProductSelection(product.sku)}
                  />
                </div>

                {/* Image */}
                <div className="w-14 flex-shrink-0 px-2">
                  <div
                    className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer"
                    onClick={() => onImageClick(product)}
                  >
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Title */}
                <div className="flex-1 min-w-0 px-2">
                  <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                    {product.title}
                  </p>
                  {product.categoryOne && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {product.categoryOne}
                      {product.categoryTwo && ` > ${product.categoryTwo}`}
                    </p>
                  )}
                </div>

                {/* SKU */}
                <div className="w-28 flex-shrink-0 px-2">
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate block">
                    {product.sku}
                  </span>
                </div>

                {/* Stock */}
                <div className="w-16 flex-shrink-0 px-2 text-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {product.stockQuantity > 0
                      ? product.stockQuantity
                      : product.stockStatus === 'in_stock'
                      ? '✓'
                      : product.stockStatus === 'out_of_stock'
                      ? '—'
                      : 'Low'}
                  </span>
                </div>

                {/* Price */}
                <div className="w-24 flex-shrink-0 px-2 text-right">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    £{product.price.toFixed(2)}
                  </p>
                  {product.wholesalePrice > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Cost: £{product.wholesalePrice.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="w-24 flex-shrink-0 px-2 flex justify-center">
                  <StockBadge status={product.stockStatus} />
                </div>

                {/* Actions */}
                <div className="w-28 flex-shrink-0 px-2 flex items-center justify-center gap-0.5">
                  <button
                    onClick={(e) => handleDownload(product, e)}
                    disabled={product.images.length === 0 || isDownloading}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download Images"
                  >
                    <Download className={`w-4 h-4 ${isDownloading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => handleCopy(product, e)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    title="Copy Description"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleFavorite(product.sku)}
                    className={`p-1.5 rounded-lg ${
                      isFavorite
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => onCalculatorClick(product)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    title="Price Calculator"
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
