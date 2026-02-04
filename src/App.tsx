import { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ProductGrid } from './components/products/ProductGrid';
import { ProductTable } from './components/products/ProductTable';
import { ImageGallery } from './components/products/ImageGallery';
import { PriceCalculator } from './components/products/PriceCalculator';
import { UploadModal } from './components/UploadModal';
import { BatchActions } from './components/BatchActions';
import { EmptyState } from './components/EmptyState';
import { useProductStore } from './stores/productStore';
import { useThemeStore } from './stores/themeStore';
import { useSettingsStore } from './stores/settingsStore';
import { useFilteredProducts } from './hooks/useFilteredProducts';
import { syncFeeds } from './services/syncService';
import { getUniqueCategories } from './services/dataMerger';
import type { Product } from './types';
import './index.css';

function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const { products, viewMode, setLoading, setError } = useProductStore();
  const { isDark } = useThemeStore();
  const {
    productFeedUrl,
    stockFeedUrl,
    isSyncing,
    setSyncing,
    setSyncError,
    setLastSyncedAt,
  } = useSettingsStore();
  const filteredProducts = useFilteredProducts();

  // Sync feeds from URLs
  const handleSync = useCallback(async () => {
    if (isSyncing) return;

    setSyncing(true);
    setSyncError(null);
    setError(null);
    setLoading(true);

    try {
      const result = await syncFeeds(productFeedUrl, stockFeedUrl);

      // Update product store with merged data
      const uniqueValues = getUniqueCategories(result.products);

      // Set products directly using the store's internal state
      useProductStore.setState({
        products: result.products,
        stats: result.stats,
        ...uniqueValues,
        isLoading: false,
        error: null,
      });

      setLastSyncedAt(Date.now());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync feeds';
      setSyncError(errorMessage);
      setError(errorMessage);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [productFeedUrl, stockFeedUrl, isSyncing, setSyncing, setSyncError, setLastSyncedAt, setLoading, setError]);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Auto-sync on mount
  useEffect(() => {
    // Only auto-sync if we don't have products loaded
    if (products.length === 0 && !isSyncing) {
      handleSync();
    }
  }, []); // Run only once on mount

  const handleImageClick = (product: Product) => {
    setSelectedProduct(product);
    setIsImageGalleryOpen(true);
  };

  const handleCalculatorClick = (product: Product) => {
    setSelectedProduct(product);
    setIsCalculatorOpen(true);
  };

  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <Header
        onUploadClick={() => setIsUploadModalOpen(true)}
        onActualizeClick={handleSync}
      />

      {/* Main Layout */}
      <div className="flex">
        {/* Mobile Menu Button */}
        {hasProducts && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden fixed bottom-4 right-4 z-40 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Sidebar */}
        {hasProducts && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
          {hasProducts ? (
            viewMode === 'grid' ? (
              <ProductGrid
                products={filteredProducts}
                onImageClick={handleImageClick}
                onCalculatorClick={handleCalculatorClick}
              />
            ) : (
              <ProductTable
                products={filteredProducts}
                onImageClick={handleImageClick}
                onCalculatorClick={handleCalculatorClick}
              />
            )
          ) : (
            <EmptyState onUploadClick={() => setIsUploadModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Batch Actions Bar */}
      <BatchActions />

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <ImageGallery
        product={selectedProduct}
        isOpen={isImageGalleryOpen}
        onClose={() => {
          setIsImageGalleryOpen(false);
          setSelectedProduct(null);
        }}
      />

      <PriceCalculator
        product={selectedProduct}
        isOpen={isCalculatorOpen}
        onClose={() => {
          setIsCalculatorOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}

export default App;
