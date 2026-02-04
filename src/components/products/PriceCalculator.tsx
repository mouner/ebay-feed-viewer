import { Calculator, TrendingUp, Percent, DollarSign } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { Product } from '../../types';
import { usePriceCalculator } from '../../hooks/usePriceCalculator';

interface PriceCalculatorProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PriceCalculator({
  product,
  isOpen,
  onClose,
}: PriceCalculatorProps) {
  const { inputs, calculation, updateInput, reset } = usePriceCalculator(
    product?.wholesalePrice || 0
  );

  if (!product) return null;

  const isProfitable = calculation.profit > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Price Calculator" size="md">
      <div className="space-y-6">
        {/* Product Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {product.images[0] && (
            <img
              src={product.images[0]}
              alt=""
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {product.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.sku}
            </p>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wholesale Cost (£)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={inputs.wholesalePrice}
              onChange={(e) =>
                updateInput('wholesalePrice', parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Markup (%)
            </label>
            <Input
              type="number"
              step="1"
              min="0"
              max="500"
              value={inputs.markupPercent}
              onChange={(e) =>
                updateInput('markupPercent', parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              eBay Fee (%)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={inputs.ebayFeePercent}
              onChange={(e) =>
                updateInput('ebayFeePercent', parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PayPal Fee (%)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={inputs.paypalFeePercent}
              onChange={(e) =>
                updateInput('paypalFeePercent', parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PayPal Fixed Fee (£)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={inputs.paypalFixedFee}
              onChange={(e) =>
                updateInput('paypalFixedFee', parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Calculation Results
          </h4>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <DollarSign className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                £{calculation.sellingPrice.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Selling Price
              </p>
            </div>

            <div
              className={`p-4 rounded-lg text-center ${
                isProfitable
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <TrendingUp
                className={`w-5 h-5 mx-auto mb-1 ${
                  isProfitable
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              />
              <p
                className={`text-2xl font-bold ${
                  isProfitable
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                £{calculation.profit.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Profit
              </p>
            </div>

            <div
              className={`p-4 rounded-lg text-center ${
                isProfitable
                  ? 'bg-purple-50 dark:bg-purple-900/20'
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <Percent
                className={`w-5 h-5 mx-auto mb-1 ${
                  isProfitable
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              />
              <p
                className={`text-2xl font-bold ${
                  isProfitable
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {calculation.roi.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ROI
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Wholesale Cost:
              </span>
              <span className="text-gray-900 dark:text-white">
                £{inputs.wholesalePrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                + Markup ({inputs.markupPercent}%):
              </span>
              <span className="text-gray-900 dark:text-white">
                £{(inputs.wholesalePrice * (inputs.markupPercent / 100)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                - eBay Fee ({inputs.ebayFeePercent}%):
              </span>
              <span className="text-red-600 dark:text-red-400">
                -£{(calculation.sellingPrice * (inputs.ebayFeePercent / 100)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                - PayPal Fee ({inputs.paypalFeePercent}% + £{inputs.paypalFixedFee}):
              </span>
              <span className="text-red-600 dark:text-red-400">
                -£{(calculation.sellingPrice * (inputs.paypalFeePercent / 100) + inputs.paypalFixedFee).toFixed(2)}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-medium">
              <span className="text-gray-700 dark:text-gray-300">
                Net Profit:
              </span>
              <span
                className={
                  isProfitable
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }
              >
                £{calculation.profit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={reset} className="flex-1">
            Reset
          </Button>
          <Button variant="primary" onClick={onClose} className="flex-1">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
