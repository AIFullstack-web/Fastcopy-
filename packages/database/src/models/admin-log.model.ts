import { Schema, model, type InferSchemaType } from 'mongoose';
const AdminLogSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, index: true },
  targetType: { type: String, required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  ipAddress: String,
  userAgent: String,
  metadata: Schema.Types.Mixed
}, { timestamps: true });
AdminLogSchema.index({ createdAt: -1 });
export type AdminLog = InferSchemaType<typeof AdminLogSchema>;
export const AdminLogModel = model('AdminLog', AdminLogSchema);
