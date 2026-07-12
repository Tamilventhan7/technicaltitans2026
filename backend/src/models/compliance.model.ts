import mongoose, { Schema, Document as MongooseDoc } from 'mongoose';
import { Document as DocumentType, Insurance as InsuranceType, License as LicenseType } from '../types';

export interface DocumentDocument extends Omit<DocumentType, 'createdAt' | 'updatedAt'>, MongooseDoc {}
export interface InsuranceDocument extends Omit<InsuranceType, 'createdAt' | 'updatedAt'>, MongooseDoc {}
export interface LicenseDocument extends Omit<LicenseType, 'createdAt' | 'updatedAt'>, MongooseDoc {}

const DocumentSchema = new Schema<DocumentDocument>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  fileUrl: { type: String, required: true },
  expiryDate: { type: Date },
  status: { 
    type: String, 
    enum: ['valid', 'expired', 'pending_review'], 
    default: 'pending_review' 
  },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const InsuranceSchema = new Schema<InsuranceDocument>({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  provider: { type: String, required: true },
  policyNumber: { type: String, required: true },
  coverageAmount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const LicenseSchema = new Schema<LicenseDocument>({
  id: { type: String, required: true, unique: true },
  driverId: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  classType: { type: String, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const DocumentModel = mongoose.model<DocumentDocument>('Document', DocumentSchema);
export const Insurance = mongoose.model<InsuranceDocument>('Insurance', InsuranceSchema);
export const License = mongoose.model<LicenseDocument>('License', LicenseSchema);
