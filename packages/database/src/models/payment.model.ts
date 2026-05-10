import { Schema, model, type InferSchemaType } from 'mongoose';
const PaymentSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  provider: { type: String, enum: ['razorpay', 'stripe'], required: true },
  providerPaymentId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'], default: 'pending', index: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['INR', 'USD'], required: true },
  commissionAmount: { type: Number, required: true },
  vendorPayoutAmount: { type: Number, required: true },
  rawWebhook: Schema.Types.Mixed
}, { timestamps: true });
PaymentSchema.index({ createdAt: -1, status: 1 });
export type Payment = InferSchemaType<typeof PaymentSchema>;
export const PaymentModel = model('Payment', PaymentSchema);
