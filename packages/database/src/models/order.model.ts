import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { GeoPointSchema } from './common';

const StatusHistorySchema = new Schema({
  status: { type: String, enum: ['new', 'accepted', 'printing', 'binding', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'], required: true },
  actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  note: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  file: {
    s3Key: { type: String, required: true },
    originalName: { type: String, required: true },
    sha256: { type: String, required: true, index: true },
    mimeType: { type: String, enum: ['application/pdf'], required: true },
    sizeBytes: { type: Number, required: true, max: 104857600 },
    pageCount: { type: Number, required: true, min: 1 },
    encrypted: { type: Boolean, default: true },
    deleteAfter: { type: Date, required: true, index: true }
  },
  printOptions: {
    pageCount: { type: Number, required: true, min: 1 },
    copies: { type: Number, required: true, min: 1 },
    colorMode: { type: String, enum: ['bw', 'color'], required: true },
    paperType: { type: String, enum: ['a4_70gsm', 'a4_80gsm', 'a3_100gsm', 'photo_glossy'], required: true },
    bindingType: { type: String, enum: ['none', 'staple', 'spiral', 'hardbound'], required: true },
    duplex: { type: Boolean, default: false }
  },
  pricing: {
    pricePerPage: Number,
    pageSubtotal: Number,
    bindingFee: Number,
    deliveryFee: Number,
    platformFee: Number,
    tax: Number,
    total: { type: Number, required: true },
    currency: { type: String, enum: ['INR', 'USD'], required: true }
  },
  fulfillmentMode: { type: String, enum: ['pickup', 'delivery'], required: true },
  deliveryLocation: GeoPointSchema,
  status: { type: String, enum: ['new', 'accepted', 'printing', 'binding', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'], default: 'new', index: true },
  statusHistory: [StatusHistorySchema],
  payment: { paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' }, provider: { type: String, enum: ['razorpay', 'stripe'] }, status: { type: String, enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'], default: 'pending' } },
  customerNotes: { type: String, maxlength: 500 },
  deliveredAt: Date,
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

OrderSchema.index({ deliveryLocation: '2dsphere' });
OrderSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ 'file.deleteAfter': 1, status: 1 });
OrderSchema.index({ createdAt: -1, status: 1 });

export type Order = InferSchemaType<typeof OrderSchema>;
export type OrderDocument = HydratedDocument<Order>;
export const OrderModel = model('Order', OrderSchema);
