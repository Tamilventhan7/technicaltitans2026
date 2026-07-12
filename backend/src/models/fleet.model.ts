import mongoose, { Schema, Document } from 'mongoose';
import { Vehicle as VehicleType, Driver as DriverType, TripStop as TripStopType, Warehouse as WarehouseType } from '../types';

export interface VehicleDocument extends Omit<VehicleType, 'createdAt' | 'updatedAt'>, Document {}
export interface DriverDocument extends Omit<DriverType, 'createdAt' | 'updatedAt'>, Document {}
export interface TripStopDocument extends Omit<TripStopType, 'createdAt' | 'updatedAt'>, Document {}
export interface WarehouseDocument extends Omit<WarehouseType, 'createdAt' | 'updatedAt'>, Document {}

const VehicleSchema = new Schema<VehicleDocument>({
  id: { type: String, required: true, unique: true },
  plateNumber: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['idle', 'in-transit', 'maintenance', 'out-of-service'], 
    default: 'idle' 
  },
  type: { 
    type: String, 
    enum: ['Heavy Duty Truck', 'Reefer', 'Medium Cargo', 'Sprinter Van'], 
    required: true 
  },
  fuelCapacity: { type: Number, required: true },
  currentFuel: { type: Number, required: true },
  fuelEfficiency: { type: Number, required: true },
  odometer: { type: Number, required: true, default: 0 },
  healthScore: { type: Number, required: true, default: 100 },
  telemetry: {
    engineTemp: { type: Number, default: 0 },
    oilPressure: { type: Number, default: 0 },
    batteryVoltage: { type: Number, default: 0 }
  },
  gps: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 }
  },
  documentIds: [{ type: String }],
  organizationId: { type: String, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const DriverSchema = new Schema<DriverDocument>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  licenseExpiry: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['available', 'driving', 'resting', 'sick', 'suspended'], 
    default: 'available' 
  },
  rating: { type: Number, default: 5.0 },
  safetyScore: { type: Number, default: 100 },
  activeHoursToday: { type: Number, default: 0 },
  totalMiles: { type: Number, default: 0 },
  gamification: {
    tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Diamond'], default: 'Bronze' },
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    safeDrivingStreak: { type: Number, default: 0 }
  },
  organizationId: { type: String, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const TripStopSchema = new Schema<TripStopDocument>({
  id: { type: String, required: true, unique: true },
  tripId: { type: String, required: true },
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  sequence: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'arrived', 'departed'], default: 'pending' },
  scheduledTime: { type: Date, required: true },
  actualTime: { type: Date },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const WarehouseSchema = new Schema<WarehouseDocument>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  capacity: { type: Number, required: true },
  inventoryLevel: { type: Number, required: true },
  incomingShipments: { type: Number, default: 0 },
  outgoingShipments: { type: Number, default: 0 },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const Vehicle = mongoose.model<VehicleDocument>('Vehicle', VehicleSchema);
export const Driver = mongoose.model<DriverDocument>('Driver', DriverSchema);
export const TripStop = mongoose.model<TripStopDocument>('TripStop', TripStopSchema);
export const Warehouse = mongoose.model<WarehouseDocument>('Warehouse', WarehouseSchema);
