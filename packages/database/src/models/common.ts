import { Schema } from 'mongoose';

export const GeoPointSchema = new Schema({
  type: { type: String, enum: ['Point'], default: 'Point', required: true },
  coordinates: { type: [Number], required: true, validate: [(value: number[]) => value.length === 2, 'Coordinates must be [lng, lat]'] }
}, { _id: false });

export const AuditSchema = new Schema({
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null }
}, { _id: false });
