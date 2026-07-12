import mongoose, { Schema } from 'mongoose';

export interface IUser {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'Admin' | 'FleetManager' | 'Dispatcher' | 'Driver' | 'SafetyOfficer' | 'FinancialAnalyst';
  department: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status: 'active' | 'inactive';
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  joiningDate: Date;
  lastLogin?: Date;
  notificationPreference: 'all' | 'critical' | 'none';
  
  // Auditing fields
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema({
  employeeId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String },
  role: { 
    type: String, 
    enum: ['Admin', 'FleetManager', 'Dispatcher', 'Driver', 'SafetyOfficer', 'FinancialAnalyst'], 
    required: true,
    index: true
  },
  department: { type: String, required: true },
  avatar: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  emergencyContact: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String }
  },
  joiningDate: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  notificationPreference: { type: String, enum: ['all', 'critical', 'none'], default: 'all' },
  
  createdBy: { type: String },
  updatedBy: { type: String },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Soft Delete Query Middleware
UserSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
UserSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
