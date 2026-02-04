import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Download, ZoomIn } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { Product } from '../../types';
import { downloadProductImages } from '../../services/imageDownloader';

interface ImageGalleryProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageGallery({ product, isOpen, onClose }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!product) return null;

  const images = product.images;
  const hasMultipleImages = images.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadProductImages(product);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div
        className="flex flex-col h-[80vh]"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {product.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.sku} · {images.length} image{images.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              isLoading={isDownloading}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download All
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image */}
        <div className="flex-1 flex items-center justify-center relative py-4">
          {hasMultipleImages && (
            <button
              onClick={goToPrevious}
              className="absolute left-0 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div
            className={`relative max-h-full ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={images[currentIndex]}
              alt={`${product.title} - Image ${currentIndex + 1}`}
              className={`
                max-h-[60vh] object-contain transition-transform duration-300
                ${isZoomed ? 'scale-150' : 'scale-100'}
              `}
            />
            <button
              className="absolute bottom-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {hasMultipleImages && (
            <button
              onClick={goToNext}
              className="absolute right-0 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Thumbnails */}
        {hasMultipleImages && (
          <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`
                    flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                    ${
                      index === currentIndex
                        ? 'border-blue-500 ring-2 ring-blue-500/30'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover image-gallery-thumbnail"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
