import { z } from 'zod';

export const UserRole = z.enum(['customer', 'vendor', 'admin']);
export type UserRole = z.infer<typeof UserRole>;

export const OrderStatus = z.enum(['new', 'accepted', 'printing', 'binding', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded']);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const ColorMode = z.enum(['bw', 'color']);
export const PaperType = z.enum(['a4_70gsm', 'a4_80gsm', 'a3_100gsm', 'photo_glossy']);
export const BindingType = z.enum(['none', 'staple', 'spiral', 'hardbound']);
export const FulfillmentMode = z.enum(['pickup', 'delivery']);

export const geoPointSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
});

export const printOptionsSchema = z.object({
  pageCount: z.number().int().positive().max(2000),
  copies: z.number().int().positive().max(100).default(1),
  colorMode: ColorMode,
  paperType: PaperType,
  bindingType: BindingType,
  duplex: z.boolean().default(false)
});

export const quoteRequestSchema = z.object({
  vendorId: z.string().min(12),
  fulfillmentMode: FulfillmentMode,
  deliveryLocation: geoPointSchema.optional(),
  options: printOptionsSchema
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export const createOrderSchema = quoteRequestSchema.extend({
  fileId: z.string().min(12),
  paymentProvider: z.enum(['razorpay', 'stripe']),
  paymentIntentId: z.string().min(8),
  customerNotes: z.string().max(500).optional()
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export interface PricingBreakdown {
  pricePerPage: number;
  pageSubtotal: number;
  bindingFee: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  total: number;
  currency: 'INR' | 'USD';
}

export function calculatePrintQuote(input: QuoteRequest, vendorRateCard: {
  bwPerPage: number;
  colorPerPage: number;
  bindingFees: Record<z.infer<typeof BindingType>, number>;
  deliveryBaseFee: number;
  platformFeePercent: number;
  taxPercent: number;
  currency: 'INR' | 'USD';
}): PricingBreakdown {
  const parsed = quoteRequestSchema.parse(input);
  const pricePerPage = parsed.options.colorMode === 'color' ? vendorRateCard.colorPerPage : vendorRateCard.bwPerPage;
  const effectiveSheets = parsed.options.duplex ? Math.ceil(parsed.options.pageCount / 2) : parsed.options.pageCount;
  const pageSubtotal = pricePerPage * effectiveSheets * parsed.options.copies;
  const bindingFee = (vendorRateCard.bindingFees[parsed.options.bindingType] ?? 0) * parsed.options.copies;
  const deliveryFee = parsed.fulfillmentMode === 'delivery' ? vendorRateCard.deliveryBaseFee : 0;
  const taxable = pageSubtotal + bindingFee + deliveryFee;
  const platformFee = Math.round((taxable * vendorRateCard.platformFeePercent) / 100);
  const tax = Math.round(((taxable + platformFee) * vendorRateCard.taxPercent) / 100);
  return { pricePerPage, pageSubtotal, bindingFee, deliveryFee, platformFee, tax, total: taxable + platformFee + tax, currency: vendorRateCard.currency };
}
