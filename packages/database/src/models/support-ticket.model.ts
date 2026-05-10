import { Schema, model, type InferSchemaType } from 'mongoose';
const SupportTicketSchema = new Schema({
  requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
  assignedAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
  subject: { type: String, required: true, maxlength: 180 },
  status: { type: String, enum: ['open', 'pending', 'resolved', 'closed'], default: 'open', index: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  messages: [{ senderId: { type: Schema.Types.ObjectId, ref: 'User' }, body: { type: String, maxlength: 4000 }, createdAt: { type: Date, default: Date.now } }],
  deletedAt: { type: Date, default: null }
}, { timestamps: true });
SupportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
export type SupportTicket = InferSchemaType<typeof SupportTicketSchema>;
export const SupportTicketModel = model('SupportTicket', SupportTicketSchema);
