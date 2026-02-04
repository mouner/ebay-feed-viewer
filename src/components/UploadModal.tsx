import { useState, useRef } from 'react';
import { Upload, FileText, Link, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Modal } from './common/Modal';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { Progress } from './common/Progress';
import { useProductStore } from '../stores/productStore';
import {
  parseProductFeed,
  parseStockFeed,
  fetchAndParseFeed,
} from '../services/feedParser';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadMethod = 'file' | 'url';
type FeedType = 'product' | 'stock';

interface FeedStatus {
  product: { loaded: boolean; count: number; error?: string };
  stock: { loaded: boolean; count: number; error?: string };
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [method, setMethod] = useState<UploadMethod>('file');
  const [productUrl, setProductUrl] = useState('');
  const [stockUrl, setStockUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFeed, setCurrentFeed] = useState<FeedType | null>(null);
  const [feedStatus, setFeedStatus] = useState<FeedStatus>({
    product: { loaded: false, count: 0 },
    stock: { loaded: false, count: 0 },
  });

  const productFileRef = useRef<HTMLInputElement>(null);
  const stockFileRef = useRef<HTMLInputElement>(null);

  const {
    setProductFeed,
    setStockFeed,
    mergeAndSetProducts,
    setLoading,
    setError,
  } = useProductStore();

  const handleFileSelect = async (
    file: File,
    feedType: FeedType
  ) => {
    setIsLoading(true);
    setCurrentFeed(feedType);
    setProgress(0);

    try {
      if (feedType === 'product') {
        const products = await parseProductFeed(file, (p) =>
          setProgress(p.percent)
        );
        setProductFeed(products);
        setFeedStatus((prev) => ({
          ...prev,
          product: { loaded: true, count: products.length },
        }));
      } else {
        const stock = await parseStockFeed(file, (p) =>
          setProgress(p.percent)
        );
        setStockFeed(stock);
        setFeedStatus((prev) => ({
          ...prev,
          stock: { loaded: true, count: stock.length },
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse file';
      setFeedStatus((prev) => ({
        ...prev,
        [feedType]: { loaded: false, count: 0, error: message },
      }));
    } finally {
      setIsLoading(false);
      setCurrentFeed(null);
      setProgress(0);
    }
  };

  const handleUrlLoad = async () => {
    if (!productUrl && !stockUrl) return;

    setIsLoading(true);
    setLoading(true);

    try {
      if (productUrl) {
        setCurrentFeed('product');
        const products = await fetchAndParseFeed(
          productUrl,
          parseProductFeed,
          (p) => setProgress(p.percent)
        );
        setProductFeed(products);
        setFeedStatus((prev) => ({
          ...prev,
          product: { loaded: true, count: products.length },
        }));
      }

      if (stockUrl) {
        setCurrentFeed('stock');
        setProgress(0);
        const stock = await fetchAndParseFeed(
          stockUrl,
          parseStockFeed,
          (p) => setProgress(p.percent)
        );
        setStockFeed(stock);
        setFeedStatus((prev) => ({
          ...prev,
          stock: { loaded: true, count: stock.length },
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load feed';
      setError(message);
    } finally {
      setIsLoading(false);
      setCurrentFeed(null);
      setProgress(0);
      setLoading(false);
    }
  };

  const handleMergeAndClose = () => {
    if (feedStatus.product.loaded || feedStatus.stock.loaded) {
      mergeAndSetProducts();
    }
    // Reset state
    setFeedStatus({
      product: { loaded: false, count: 0 },
      stock: { loaded: false, count: 0 },
    });
    setProductUrl('');
    setStockUrl('');
    onClose();
  };

  const canMerge = feedStatus.product.loaded && feedStatus.stock.loaded;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Feeds" size="lg">
      <div className="space-y-6">
        {/* Method Toggle */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            onClick={() => setMethod('file')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
              method === 'file'
                ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
          <button
            onClick={() => setMethod('url')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
              method === 'url'
                ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Link className="w-4 h-4" />
            Load from URL
          </button>
        </div>

        {method === 'file' ? (
          <div className="space-y-4">
            {/* Product Feed Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Feed (TSV/CSV)
              </label>
              <input
                ref={productFileRef}
                type="file"
                accept=".tsv,.csv,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, 'product');
                }}
              />
              <div
                onClick={() => productFileRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${
                    feedStatus.product.loaded
                      ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }
                `}
              >
                {feedStatus.product.loaded ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>{feedStatus.product.count} products loaded</span>
                  </div>
                ) : feedStatus.product.error ? (
                  <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{feedStatus.product.error}</span>
                  </div>
                ) : currentFeed === 'product' ? (
                  <div className="space-y-2">
                    <Loader2 className="w-6 h-6 mx-auto spinner text-blue-600" />
                    <Progress value={progress} size="sm" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                    <FileText className="w-8 h-8" />
                    <span>Click to upload product feed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Feed Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock Feed (CSV)
              </label>
              <input
                ref={stockFileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, 'stock');
                }}
              />
              <div
                onClick={() => stockFileRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${
                    feedStatus.stock.loaded
                      ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }
                `}
              >
                {feedStatus.stock.loaded ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>{feedStatus.stock.count} stock items loaded</span>
                  </div>
                ) : feedStatus.stock.error ? (
                  <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{feedStatus.stock.error}</span>
                  </div>
                ) : currentFeed === 'stock' ? (
                  <div className="space-y-2">
                    <Loader2 className="w-6 h-6 mx-auto spinner text-blue-600" />
                    <Progress value={progress} size="sm" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                    <FileText className="w-8 h-8" />
                    <span>Click to upload stock feed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Product Feed URL */}
            <Input
              label="Product Feed URL"
              type="url"
              placeholder="https://example.com/products.tsv"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              disabled={isLoading}
            />

            {/* Stock Feed URL */}
            <Input
              label="Stock Feed URL"
              type="url"
              placeholder="https://example.com/stock.csv"
              value={stockUrl}
              onChange={(e) => setStockUrl(e.target.value)}
              disabled={isLoading}
            />

            {/* Load Button */}
            <Button
              onClick={handleUrlLoad}
              isLoading={isLoading}
              disabled={!productUrl && !stockUrl}
              className="w-full"
            >
              Load Feeds
            </Button>

            {/* Progress */}
            {isLoading && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Loading {currentFeed} feed...
                </p>
                <Progress value={progress} />
              </div>
            )}

            {/* Status */}
            {(feedStatus.product.loaded || feedStatus.stock.loaded) && (
              <div className="space-y-2">
                {feedStatus.product.loaded && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {feedStatus.product.count} products loaded
                    </span>
                  </div>
                )}
                {feedStatus.stock.loaded && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {feedStatus.stock.count} stock items loaded
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleMergeAndClose}
            disabled={!feedStatus.product.loaded && !feedStatus.stock.loaded}
            className="flex-1"
          >
            {canMerge ? 'Merge & View' : 'View Products'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
