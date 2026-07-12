import mongoose, { Schema } from 'mongoose';

export interface IDriver {
  driverId: string; // e.g. DRV-01
  name: string;
  licenseNumber: string;
  licenseExpiry: Date;
  bloodGroup: string;
  phone: string;
  email: string;
  address?: string;
  joiningDate: Date;
  salary: number;
  experience: number; // Years
  safetyScore: number; // 0 - 100
  rewardPoints: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Elite';
  documents: string[];
  status: 'available' | 'driving' | 'resting' | 'sick' | 'suspended';
  photo?: string;
  
  // Auditing fields
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const DriverSchema: Schema = new Schema({
  driverId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  licenseExpiry: { type: Date, required: true },
  bloodGroup: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  address: { type: String },
  joiningDate: { type: Date, default: Date.now },
  salary: { type: Number, required: true },
  experience: { type: Number, required: true },
  safetyScore: { type: Number, default: 90, min: 0, max: 100 },
  rewardPoints: { type: Number, default: 0 },
  rank: { 
    type: String, 
    enum: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Elite'], 
    default: 'Bronze',
    index: true
  },
  documents: [{ type: String }],
  status: { 
    type: String, 
    enum: ['available', 'driving', 'resting', 'sick', 'suspended'], 
    default: 'available',
    index: true
  },
  photo: { type: String },
  
  createdBy: { type: String },
  updatedBy: { type: String },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

DriverSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
DriverSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

export default mongoose.models.Driver || mongoose.model<IDriver>('Driver', DriverSchema);
