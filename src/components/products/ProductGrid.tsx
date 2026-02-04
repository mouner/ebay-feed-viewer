import { useRef, useCallback, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ProductCard } from './ProductCard';
import type { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  onImageClick: (product: Product) => void;
  onCalculatorClick: (product: Product) => void;
}

export function ProductGrid({
  products,
  onImageClick,
  onCalculatorClick,
}: ProductGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const getColumnCount = useCallback(() => {
    if (typeof window === 'undefined') return 4;
    const width = parentRef.current?.clientWidth || window.innerWidth;
    if (width < 640) return 1;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    if (width < 1280) return 4;
    return 5;
  }, []);

  const [columnCount, setColumnCount] = useState(getColumnCount);

  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [getColumnCount]);

  const rowCount = Math.ceil(products.length / columnCount);
  const rowHeight = 520;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 3,
  });

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
    <div
      ref={parentRef}
      className="flex-1 overflow-auto p-4 virtual-list-container"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columnCount;
          const rowProducts = products.slice(
            startIndex,
            startIndex + columnCount
          );

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                gap: '1rem',
                paddingBottom: '1rem',
              }}
            >
              {rowProducts.map((product) => (
                <ProductCard
                  key={product.sku}
                  product={product}
                  onImageClick={onImageClick}
                  onCalculatorClick={onCalculatorClick}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
