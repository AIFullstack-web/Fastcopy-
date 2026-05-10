import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { GeoPointSchema } from './common';

const VendorSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  shopName: { type: String, required: true, trim: true, maxlength: 160 },
  slug: { type: String, required: true, unique: true, lowercase: true },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending', index: true },
  location: { type: GeoPointSchema, required: true },
  address: { line1: String, line2: String, city: String, state: String, postalCode: String, country: String },
  capabilities: [{ type: String, enum: ['bw', 'color', 'spiral', 'hardbound', 'photo', 'delivery'] }],
  availability: { isOpen: { type: Boolean, default: false }, acceptsNewOrders: { type: Boolean, default: true }, machineStatus: { type: String, enum: ['online', 'maintenance', 'offline'], default: 'online' } },
  rateCard: {
    bwPerPage: { type: Number, required: true, min: 1 },
    colorPerPage: { type: Number, required: true, min: 1 },
    bindingFees: { none: { type: Number, default: 0 }, staple: { type: Number, default: 5 }, spiral: { type: Number, default: 30 }, hardbound: { type: Number, default: 120 } },
    deliveryBaseFee: { type: Number, default: 30 },
    platformFeePercent: { type: Number, default: 8 },
    taxPercent: { type: Number, default: 18 },
    currency: { type: String, enum: ['INR', 'USD'], default: 'INR' }
  },
  ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
  completedOrders: { type: Number, default: 0 },
  commissionPercent: { type: Number, default: 12 },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

VendorSchema.index({ location: '2dsphere' });
VendorSchema.index({ approvalStatus: 1, 'availability.isOpen': 1, 'availability.acceptsNewOrders': 1 });
VendorSchema.index({ shopName: 'text', slug: 'text' });

export type Vendor = InferSchemaType<typeof VendorSchema>;
export type VendorDocument = HydratedDocument<Vendor>;
export const VendorModel = model('Vendor', VendorSchema);
