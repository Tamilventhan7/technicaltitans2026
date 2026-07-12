import mongoose, { Schema } from 'mongoose';

export interface IMaintenance {
  maintenanceId: string;
  vehicle: string; // Vehicle ID e.g. TRK-01
  maintenanceType: 'Routine Oil Change' | 'Brake Replacement' | 'Engine Overhaul' | 'Tire Rotation' | 'Sensor Calibration';
  description: string;
  garage: string;
  cost: number;
  nextServiceDate: Date;
  currentMileage: number;
  nextMileage: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  invoice?: string; // Document Reference
  technician: string;
  
  // Auditing fields
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const MaintenanceSchema: Schema = new Schema({
  maintenanceId: { type: String, required: true, unique: true, index: true },
  vehicle: { type: String, required: true, index: true },
  maintenanceType: { 
    type: String, 
    enum: ['Routine Oil Change', 'Brake Replacement', 'Engine Overhaul', 'Tire Rotation', 'Sensor Calibration'], 
    required: true 
  },
  description: { type: String, required: true },
  garage: { type: String, required: true },
  cost: { type: Number, required: true, min: 0 },
  nextServiceDate: { type: Date, required: true },
  currentMileage: { type: Number, required: true },
  nextMileage: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'in-progress', 'completed'], 
    default: 'scheduled',
    index: true
  },
  invoice: { type: String },
  technician: { type: String, required: true },
  
  createdBy: { type: String },
  updatedBy: { type: String },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

MaintenanceSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
MaintenanceSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

export default mongoose.models.Maintenance || mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);
