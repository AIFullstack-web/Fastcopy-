import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, trim: true, maxlength: 120 },
  email: { type: String, lowercase: true, trim: true, sparse: true },
  phone: { type: String, required: true, trim: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], required: true, index: true },
  avatarUrl: String,
  refreshTokenHash: String,
  otpHash: String,
  otpExpiresAt: Date,
  lastLoginAt: Date,
  isBlocked: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

UserSchema.index({ phone: 1, role: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
UserSchema.index({ email: 1 }, { sparse: true });
UserSchema.index({ createdAt: -1 });

export type User = InferSchemaType<typeof UserSchema>;
export type UserDocument = HydratedDocument<User>;
export const UserModel = model('User', UserSchema);
