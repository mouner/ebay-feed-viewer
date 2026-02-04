import React, { useState } from 'react';
import {
  Download,
  Copy,
  Heart,
  ExternalLink,
  Check,
  ImageIcon,
  Layers,
} from 'lucide-react';
import { Button } from '../common/Button';
import { StockBadge } from '../common/Badge';
import type { Product } from '../../types';
import { useProductStore } from '../../stores/productStore';
import { downloadProductImages, copyDescription } from '../../services/imageDownloader';

interface ProductCardProps {
  product: Product;
  onImageClick: (product: Product) => void;
  onCalculatorClick: (product: Product) => void;
}

export function ProductCard({
  product,
  onImageClick,
  onCalculatorClick,
}: ProductCardProps) {
  const { favorites, toggleFavorite, selectedProducts, toggleProductSelection } =
    useProductStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [titleCopied, setTitleCopied] = useState(false);
  const [skuCopied, setSkuCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isFavorite = favorites.has(product.sku);
  const isSelected = selectedProducts.has(product.sku);
  const primaryImage = product.images[0];

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.images.length === 0) return;
    setIsDownloading(true);
    try {
      await downloadProductImages(product);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      copyDescription(product, 'html');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.sku);
  };

  const handleTitleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(product.title);
    setTitleCopied(true);
    setTimeout(() => setTitleCopied(false), 2000);
  };

  const handleSkuCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(product.sku);
    setSkuCopied(true);
    setTimeout(() => setSkuCopied(false), 2000);
  };

  return (
    <div
      className={`
        product-card relative flex flex-col bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden
        ${isSelected ? 'border-blue-500' : 'border-transparent'}
        shadow-sm hover:shadow-lg
      `}
    >
      {/* Selection Checkbox */}
      <button
        onClick={() => toggleProductSelection(product.sku)}
        className={`
          absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
          ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 hover:border-blue-400'
          }
        `}
      >
        {isSelected && <Check className="w-4 h-4" />}
      </button>

      {/* Favorite Button */}
      <button
        onClick={handleFavorite}
        className={`
          absolute top-2 right-2 z-10 p-1.5 rounded-full transition-colors
          ${
            isFavorite
              ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
              : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-red-500'
          }
        `}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Image */}
      <div
        className="relative aspect-square bg-gray-100 dark:bg-gray-700 cursor-pointer"
        onClick={() => onImageClick(product)}
      >
        {primaryImage && !imageError ? (
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}

        {/* Image Count Badge */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {product.images.length}
          </div>
        )}

        {/* Variations Badge */}
        {product.hasVariations && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-purple-600/90 text-white text-xs rounded-full flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Variations
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-3">
        {/* SKU & Stock */}
        <div className="flex items-center justify-between gap-2">
          <span
            onClick={handleSkuCopy}
            className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            title="Click to copy SKU"
          >
            {skuCopied ? '✓ Copied!' : product.sku}
          </span>
          <StockBadge status={product.stockStatus} />
        </div>

        {/* Title */}
        <h3
          onClick={handleTitleCopy}
          className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          title="Click to copy title"
        >
          {titleCopied ? '✓ Copied!' : product.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            £{(product.wholesalePrice > 0 ? product.wholesalePrice : product.price).toFixed(2)}
          </span>
          {product.wholesalePrice > 0 && product.price > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
              £{product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Quantity */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {product.stockQuantity > 0
            ? `${product.stockQuantity} in stock`
            : product.stockStatus === 'in_stock'
            ? 'In Stock'
            : product.stockStatus === 'out_of_stock'
            ? 'Out of Stock'
            : 'Low Stock'}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            isLoading={isDownloading}
            disabled={product.images.length === 0}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="flex-1"
          >
            Images
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            leftIcon={
              copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )
            }
            className="flex-1"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        {/* Calculator Link */}
        <button
          onClick={() => onCalculatorClick(product)}
          className="w-full text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Price Calculator
        </button>
      </div>
    </div>
  );
}
