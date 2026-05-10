'use client';
import { calculatePrintQuote } from '@fastcopy/shared';
import { useMemo } from 'react';
import { useOrderStore } from '../../stores/order-store';

export function PricingCard() {
  const pageCount = useOrderStore(state => state.pageCount);
  const quote = useMemo(() => pageCount ? calculatePrintQuote({ vendorId: 'preview-vendor', fulfillmentMode: 'delivery', options: { pageCount, copies: 1, colorMode: 'bw', paperType: 'a4_70gsm', bindingType: 'spiral', duplex: false } }, { bwPerPage: 2, colorPerPage: 10, bindingFees: { none: 0, staple: 5, spiral: 30, hardbound: 120 }, deliveryBaseFee: 30, platformFeePercent: 8, taxPercent: 18, currency: 'INR' }) : undefined, [pageCount]);
  return <aside className="glass-card rounded-[2rem] p-6"><h3 className="text-lg font-semibold">Live price estimate</h3>{quote ? <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt>Pages</dt><dd>₹{quote.pageSubtotal}</dd></div><div className="flex justify-between"><dt>Binding</dt><dd>₹{quote.bindingFee}</dd></div><div className="flex justify-between"><dt>Delivery</dt><dd>₹{quote.deliveryFee}</dd></div><div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold dark:border-white/10"><dt>Total</dt><dd>₹{quote.total}</dd></div></dl> : <p className="mt-4 text-sm text-slate-500">Upload a PDF to calculate pricing.</p>}</aside>;
}
