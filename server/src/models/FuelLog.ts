import mongoose, { Schema } from 'mongoose';

export interface IFuelLog {
  vehicle: string; // Vehicle ID e.g. TRK-01
  driver: string; // Driver ID e.g. DRV-01
  trip?: string; // Optional Active Trip
  fuelType: 'Diesel' | 'Electric' | 'Hybrid' | 'Gasoline';
  litres: number;
  amount: number;
  fuelStation: string;
  odometer: number;
  mileage?: number;
  date: Date;
  receipt?: string; // Receipt Document reference
  
  // Auditing fields
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const FuelLogSchema: Schema = new Schema({
  vehicle: { type: String, required: true, index: true },
  driver: { type: String, required: true, index: true },
  trip: { type: String },
  fuelType: { type: String, enum: ['Diesel', 'Electric', 'Hybrid', 'Gasoline'], required: true },
  litres: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  fuelStation: { type: String, required: true },
  odometer: { type: Number, required: true },
  mileage: { type: Number },
  date: { type: Date, default: Date.now },
  receipt: { type: String },
  
  createdBy: { type: String },
  updatedBy: { type: String },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

FuelLogSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
FuelLogSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

export default mongoose.models.FuelLog || mongoose.model<IFuelLog>('FuelLog', FuelLogSchema);
