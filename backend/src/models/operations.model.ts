import mongoose, { Schema, Document } from 'mongoose';
import { FuelLog as FuelLogType, MaintenanceRecord as MaintenanceRecordType, Expense as ExpenseType, Invoice as InvoiceType } from '../types';

export interface FuelLogDocument extends Omit<FuelLogType, 'createdAt' | 'updatedAt'>, Document {}
export interface MaintenanceRecordDocument extends Omit<MaintenanceRecordType, 'createdAt' | 'updatedAt'>, Document {}
export interface ExpenseDocument extends Omit<ExpenseType, 'createdAt' | 'updatedAt'>, Document {}
export interface InvoiceDocument extends Omit<InvoiceType, 'createdAt' | 'updatedAt'>, Document {}

const FuelLogSchema = new Schema<FuelLogDocument>({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  driverId: { type: String, required: true },
  date: { type: Date, required: true },
  liters: { type: Number, required: true },
  cost: { type: Number, required: true },
  station: { type: String, required: true },
  odometer: { type: Number, required: true },
  theftDetected: { type: Boolean, default: false },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const MaintenanceRecordSchema = new Schema<MaintenanceRecordDocument>({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  date: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['Routine Oil Change', 'Brake Replacement', 'Engine Overhaul', 'Tire Rotation', 'Sensor Calibration'], 
    required: true 
  },
  cost: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'in-progress', 'completed'], 
    default: 'scheduled' 
  },
  notes: { type: String, default: '' },
  partsReplaced: [{ type: String }],
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const ExpenseSchema = new Schema<ExpenseDocument>({
  id: { type: String, required: true, unique: true },
  organizationId: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  approvedBy: { type: String },
  date: { type: Date, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const InvoiceSchema = new Schema<InvoiceDocument>({
  id: { type: String, required: true, unique: true },
  tripId: { type: String, required: true },
  organizationId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'overdue'], 
    default: 'pending' 
  },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const FuelLog = mongoose.model<FuelLogDocument>('FuelLog', FuelLogSchema);
export const MaintenanceRecord = mongoose.model<MaintenanceRecordDocument>('MaintenanceRecord', MaintenanceRecordSchema);
export const Expense = mongoose.model<ExpenseDocument>('Expense', ExpenseSchema);
export const Invoice = mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema);
