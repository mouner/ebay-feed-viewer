import { useState, useMemo } from 'react';
import type { PriceCalculation } from '../types';

interface PriceCalculatorInput {
  wholesalePrice: number;
  markupPercent: number;
  ebayFeePercent: number;
  paypalFeePercent: number;
  paypalFixedFee: number;
}

export function usePriceCalculator(initialWholesalePrice: number = 0) {
  const [inputs, setInputs] = useState<PriceCalculatorInput>({
    wholesalePrice: initialWholesalePrice,
    markupPercent: 30,
    ebayFeePercent: 12.9,
    paypalFeePercent: 2.9,
    paypalFixedFee: 0.30,
  });

  const calculation = useMemo((): PriceCalculation => {
    const { wholesalePrice, markupPercent, ebayFeePercent, paypalFeePercent, paypalFixedFee } = inputs;

    // Calculate selling price with markup
    const sellingPrice = wholesalePrice * (1 + markupPercent / 100);

    // Calculate fees
    const ebayFee = sellingPrice * (ebayFeePercent / 100);
    const paypalFee = sellingPrice * (paypalFeePercent / 100) + paypalFixedFee;
    const totalFees = ebayFee + paypalFee;

    // Calculate profit
    const profit = sellingPrice - wholesalePrice - totalFees;

    // Calculate ROI
    const roi = wholesalePrice > 0 ? (profit / wholesalePrice) * 100 : 0;

    return {
      markupPercent,
      ebayFeePercent,
      paypalFeePercent,
      paypalFixedFee,
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      roi: Math.round(roi * 100) / 100,
    };
  }, [inputs]);

  const updateInput = <K extends keyof PriceCalculatorInput>(
    key: K,
    value: PriceCalculatorInput[K]
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setInputs({
      wholesalePrice: initialWholesalePrice,
      markupPercent: 30,
      ebayFeePercent: 12.9,
      paypalFeePercent: 2.9,
      paypalFixedFee: 0.30,
    });
  };

  return {
    inputs,
    calculation,
    updateInput,
    reset,
  };
}
