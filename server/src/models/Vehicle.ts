import mongoose, { Schema } from 'mongoose';

export interface IVehicle {
  vehicleNumber: string; // e.g. TRK-01 / TX-892A
  vehicleType: 'Heavy Duty Truck' | 'Reefer' | 'Medium Cargo' | 'Sprinter Van';
  brand: string;
  model: string; // Cascadia
  year: number;
  fuelType: 'Diesel' | 'Electric' | 'Hybrid' | 'Gasoline';
  capacity: number; // Payload capacity in KG
  engineNumber: string;
  chassisNumber: string;
  insuranceNumber: string;
  insuranceExpiry: Date;
  fitnessExpiry: Date;
  pollutionExpiry: Date;
  purchaseDate: Date;
  purchaseCost: number;
  odometer: number;
  status: 'idle' | 'in-transit' | 'maintenance' | 'out-of-service';
  healthScore: number; // 0 - 100
  assignedDriver?: string;
  assignedTrip?: string;
  documents: string[];
  images: string[];
  
  // Auditing fields
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema: Schema = new Schema({
  vehicleNumber: { type: String, required: true, unique: true, index: true },
  vehicleType: { 
    type: String, 
    enum: ['Heavy Duty Truck', 'Reefer', 'Medium Cargo', 'Sprinter Van'], 
    required: true 
  },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  fuelType: { type: String, enum: ['Diesel', 'Electric', 'Hybrid', 'Gasoline'], required: true },
  capacity: { type: Number, required: true },
  engineNumber: { type: String, required: true },
  chassisNumber: { type: String, required: true },
  insuranceNumber: { type: String, required: true },
  insuranceExpiry: { type: Date, required: true },
  fitnessExpiry: { type: Date, required: true },
  pollutionExpiry: { type: Date, required: true },
  purchaseDate: { type: Date, required: true },
  purchaseCost: { type: Number, required: true },
  odometer: { type: Number, required: true, default: 0 },
  status: { 
    type: String, 
    enum: ['idle', 'in-transit', 'maintenance', 'out-of-service'], 
    default: 'idle',
    index: true
  },
  healthScore: { type: Number, default: 100, min: 0, max: 100 },
  assignedDriver: { type: String },
  assignedTrip: { type: String },
  documents: [{ type: String }],
  images: [{ type: String }],
  
  createdBy: { type: String },
  updatedBy: { type: String },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

VehicleSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
VehicleSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

export default mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
