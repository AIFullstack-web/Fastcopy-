import { Schema, model, type InferSchemaType } from 'mongoose';
const ReviewSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });
ReviewSchema.index({ vendorId: 1, rating: 1, createdAt: -1 });
export type Review = InferSchemaType<typeof ReviewSchema>;
export const ReviewModel = model('Review', ReviewSchema);
