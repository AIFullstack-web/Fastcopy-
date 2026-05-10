import { create } from 'zustand';
import type { PricingBreakdown } from '@fastcopy/shared';

type OrderState = {
  file?: File;
  pageCount: number;
  quote?: PricingBreakdown;
  setFile: (file?: File) => void;
  setPageCount: (pageCount: number) => void;
  setQuote: (quote?: PricingBreakdown) => void;
};

export const useOrderStore = create<OrderState>(set => ({
  pageCount: 0,
  setFile: file => set({ file }),
  setPageCount: pageCount => set({ pageCount }),
  setQuote: quote => set({ quote })
}));
