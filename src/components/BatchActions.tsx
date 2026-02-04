import { useState } from 'react';
import { Download, X, Loader2 } from 'lucide-react';
import { Button } from './common/Button';
import { Progress } from './common/Progress';
import { useProductStore } from '../stores/productStore';
import { useFilteredProducts } from '../hooks/useFilteredProducts';
import { downloadBatchImages, type DownloadProgress } from '../services/imageDownloader';

export function BatchActions() {
  const { selectedProducts, clearSelection } = useProductStore();
  const filteredProducts = useFilteredProducts();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);

  const selectedCount = selectedProducts.size;
  const selectedProductsList = filteredProducts.filter((p) =>
    selectedProducts.has(p.sku)
  );

  const handleBatchDownload = async () => {
    if (selectedProductsList.length === 0) return;

    setIsDownloading(true);
    try {
      await downloadBatchImages(selectedProductsList, (progress) => {
        setDownloadProgress(progress);
      });
    } catch (error) {
      console.error('Batch download failed:', error);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-2xl px-4 py-3 flex items-center gap-4">
        {/* Selection Count */}
        <span className="text-sm">
          <span className="font-bold">{selectedCount}</span> selected
        </span>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Actions */}
        {isDownloading ? (
          <div className="flex items-center gap-3 min-w-[200px]">
            <Loader2 className="w-4 h-4 spinner" />
            <div className="flex-1">
              <Progress
                value={downloadProgress?.percent || 0}
                size="sm"
                showValue={false}
              />
              <p className="text-xs text-gray-400 mt-1 truncate">
                {downloadProgress?.currentFile || 'Preparing...'}
              </p>
            </div>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleBatchDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Images
          </Button>
        )}

        {/* Clear Selection */}
        <button
          onClick={clearSelection}
          className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
