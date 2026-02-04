import { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, Upload, LayoutGrid, Table, Download, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { SearchInput } from '../common/Input';
import { useThemeStore } from '../../stores/themeStore';
import { useProductStore } from '../../stores/productStore';
import { useFilterStore } from '../../stores/filterStore';
import { useSettingsStore, formatTimeAgo } from '../../stores/settingsStore';
import { useFilteredProducts } from '../../hooks/useFilteredProducts';
import { exportProductsToCSV } from '../../services/exportService';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface HeaderProps {
  onUploadClick: () => void;
  onActualizeClick: () => void;
}

export function Header({ onUploadClick, onActualizeClick }: HeaderProps) {
  const { isDark, toggleTheme } = useThemeStore();
  const { viewMode, setViewMode, products } = useProductStore();
  const { searchQuery, setSearchQuery } = useFilterStore();
  const { lastSyncedAt, isSyncing } = useSettingsStore();
  const filteredProducts = useFilteredProducts();

  // Local state for immediate input response
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  // Sync debounced value to store
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  // Sync store to local when cleared externally
  useEffect(() => {
    if (searchQuery === '' && localSearch !== '') {
      setLocalSearch('');
    }
  }, [searchQuery]);

  const handleExport = () => {
    if (filteredProducts.length > 0) {
      exportProductsToCSV(filteredProducts);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                eBay Feed Viewer
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {products.length > 0
                  ? `${filteredProducts.length} of ${products.length} products`
                  : isSyncing
                  ? 'Syncing feeds...'
                  : 'Upload feeds to get started'}
                {lastSyncedAt && products.length > 0 && (
                  <span className="ml-2">• Last synced: {formatTimeAgo(lastSyncedAt)}</span>
                )}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <SearchInput
              placeholder="Search by SKU, title, or description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            {products.length > 0 && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  title="Table View"
                >
                  <Table className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Export Button */}
            {filteredProducts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                leftIcon={<Download className="w-4 h-4" />}
                className="hidden sm:flex"
              >
                Export
              </Button>
            )}

            {/* Actualize Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={onActualizeClick}
              disabled={isSyncing}
              leftIcon={
                isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )
              }
              className="hidden sm:flex"
            >
              {isSyncing ? 'Syncing...' : 'Actualize'}
            </Button>

            {/* Upload Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={onUploadClick}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Upload Feeds</span>
              <span className="sm:hidden">Upload</span>
            </Button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <SearchInput
            placeholder="Search products..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
}
