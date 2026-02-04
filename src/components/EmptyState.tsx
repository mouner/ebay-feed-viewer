import { Upload, Package } from 'lucide-react';
import { Button } from './common/Button';

interface EmptyStateProps {
  onUploadClick: () => void;
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Package className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to eBay Feed Viewer
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Upload your Aosom supplier product and stock feeds to get started.
          View, filter, and manage all your products in one place.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={onUploadClick}
          leftIcon={<Upload className="w-5 h-5" />}
        >
          Upload Feeds
        </Button>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-left">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Supported Formats
          </h3>
          <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <li>• <strong>Product Feed:</strong> TSV or CSV with SKU, Title, Description, Images, Category</li>
            <li>• <strong>Stock Feed:</strong> CSV with SKU, Stock quantity, Price, Wholesale Price</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
