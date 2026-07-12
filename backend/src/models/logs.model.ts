import mongoose, { Schema, Document } from 'mongoose';
import { ActivityLog as ActivityLogType, AuditLog as AuditLogType, Report as ReportType } from '../types';

export interface ActivityLogDocument extends Omit<ActivityLogType, 'createdAt' | 'updatedAt'>, Document {}
export interface AuditLogDocument extends Omit<AuditLogType, 'createdAt' | 'updatedAt'>, Document {}
export interface ReportDocument extends Omit<ReportType, 'createdAt' | 'updatedAt'>, Document {}

const ActivityLogSchema = new Schema<ActivityLogDocument>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const AuditLogSchema = new Schema<AuditLogDocument>({
  id: { type: String, required: true, unique: true },
  resourceType: { type: String, required: true },
  resourceId: { type: String, required: true },
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  oldState: { type: Schema.Types.Mixed },
  newState: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const ReportSchema = new Schema<ReportDocument>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['PDF', 'Excel', 'CSV'], required: true },
  fileUrl: { type: String, required: true },
  generatedBy: { type: String, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const ActivityLog = mongoose.model<ActivityLogDocument>('ActivityLog', ActivityLogSchema);
export const AuditLog = mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);
export const Report = mongoose.model<ReportDocument>('Report', ReportSchema);
