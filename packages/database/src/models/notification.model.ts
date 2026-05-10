import { Schema, model, type InferSchemaType } from 'mongoose';
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['order', 'payment', 'support', 'system'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: Schema.Types.Mixed,
  readAt: Date,
  deliveredAt: Date
}, { timestamps: true });
NotificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });
export type Notification = InferSchemaType<typeof NotificationSchema>;
export const NotificationModel = model('Notification', NotificationSchema);
