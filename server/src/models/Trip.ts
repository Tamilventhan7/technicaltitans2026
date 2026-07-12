import mongoose, { Schema } from 'mongoose';

export interface ITrip {
  tripId: string; // e.g. TRIP-102
  vehicle: string; // Vehicle ID e.g. TRK-01
  driver: string; // Driver ID e.g. DRV-01
  pickupLocation: string;
  dropLocation: string;
  distance: number; // KM
  estimatedTime: number; // Hours
  actualTime?: number; // Hours
  route: Array<{ lat: number; lng: number }>;
  currentRouteIndex: number;
  tripStatus: 'pending' | 'dispatched' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled';
  cargoType: 'hazmat' | 'cold-chain' | 'high-value' | 'standard';
  customer: string;
  tripStart?: Date;
  tripEnd?: Date;
  fuelUsed: number; // Liters
  expenses: number; // Total trip expenses in USD
  proofOfDelivery?: {
    signature: string; // Base64 signature canvas
    photoUrl: string; // Base64 cargo photo
    deliveredAt: Date;
    receivedBy: string;
  };
  rating?: number; // Customer satisfaction rating
  
  // Auditing fields
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const TripSchema: Schema = new Schema({
  tripId: { type: String, required: true, unique: true, index: true },
  vehicle: { type: String, required: true, index: true },
  driver: { type: String, required: true, index: true },
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
  distance: { type: Number, required: true },
  estimatedTime: { type: Number, required: true },
  actualTime: { type: Number },
  route: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
  currentRouteIndex: { type: Number, default: 0 },
  tripStatus: { 
    type: String, 
    enum: ['pending', 'dispatched', 'in-transit', 'delivered', 'delayed', 'cancelled'], 
    default: 'pending',
    index: true
  },
  cargoType: { 
    type: String, 
    enum: ['hazmat', 'cold-chain', 'high-value', 'standard'], 
    required: true 
  },
  customer: { type: String, required: true },
  tripStart: { type: Date },
  tripEnd: { type: Date },
  fuelUsed: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  proofOfDelivery: {
    signature: { type: String },
    photoUrl: { type: String },
    deliveredAt: { type: Date },
    receivedBy: { type: String }
  },
  rating: { type: Number, min: 1, max: 5 },
  
  createdBy: { type: String },
  updatedBy: { type: String },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

TripSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
TripSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

export default mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);
