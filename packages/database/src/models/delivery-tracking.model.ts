import { Schema, model, type InferSchemaType } from 'mongoose';
import { GeoPointSchema } from './common';
const DeliveryTrackingSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  courierName: String,
  courierPhone: String,
  status: { type: String, enum: ['assigned', 'picked_up', 'nearby', 'delivered', 'failed'], default: 'assigned', index: true },
  currentLocation: GeoPointSchema,
  etaMinutes: Number,
  events: [{ status: String, location: GeoPointSchema, note: String, createdAt: { type: Date, default: Date.now } }]
}, { timestamps: true });
DeliveryTrackingSchema.index({ currentLocation: '2dsphere' });
export type DeliveryTracking = InferSchemaType<typeof DeliveryTrackingSchema>;
export const DeliveryTrackingModel = model('DeliveryTracking', DeliveryTrackingSchema);
