import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType, Organization as OrgType } from '../types';

export interface UserDocument extends Omit<UserType, 'createdAt' | 'updatedAt'>, Document {}
export interface OrgDocument extends Omit<OrgType, 'createdAt' | 'updatedAt'>, Document {}

const OrganizationSchema = new Schema<OrgDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subscriptionTier: { type: String, enum: ['Standard', 'Enterprise'], default: 'Standard' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const UserSchema = new Schema<UserDocument>({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Fleet Manager', 'Dispatcher', 'Driver', 'Safety Officer', 'Financial Analyst'],
    required: true 
  },
  organizationId: { type: String, required: true },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  refreshToken: { type: String, default: null },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const Organization = mongoose.model<OrgDocument>('Organization', OrganizationSchema);
export const User = mongoose.model<UserDocument>('User', UserSchema);
