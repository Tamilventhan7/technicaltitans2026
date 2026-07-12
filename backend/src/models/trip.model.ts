import mongoose, { Schema, Document } from 'mongoose';
import { Trip as TripType, SOSAlert as SOSAlertType, RouteSuggestion as RouteSuggestionType, Alert as AlertType } from '../types';

export interface TripDocument extends Omit<TripType, 'createdAt' | 'updatedAt'>, Document {}
export interface SOSAlertDocument extends Omit<SOSAlertType, 'createdAt' | 'updatedAt'>, Document {}
export interface RouteSuggestionDocument extends Omit<RouteSuggestionType, 'createdAt' | 'updatedAt'>, Document {}
export interface AlertDocument extends Omit<AlertType, 'createdAt' | 'updatedAt'>, Document {}

const TripSchema = new Schema<TripDocument>({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  vehicleId: { type: String, required: true },
  driverId: { type: String, required: true },
  origin: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  destination: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { 
    type: String, 
    enum: ['pending', 'dispatched', 'in-transit', 'delivered', 'delayed', 'cancelled'], 
    default: 'pending' 
  },
  cargoType: { type: String, required: true },
  cargoWeight: { type: Number, required: true },
  departureTime: { type: Date, required: true },
  estimatedArrivalTime: { type: Date, required: true },
  actualArrivalTime: { type: Date },
  route: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
  currentRouteIndex: { type: Number, default: 0 },
  telemetryLogs: [{
    timestamp: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number, required: true },
    fuelRemaining: { type: Number, required: true }
  }],
  alertsTriggered: [{ type: String }],
  financials: {
    revenue: { type: Number, required: true },
    cost: { type: Number, required: true, default: 0 },
    fuelCost: { type: Number, required: true, default: 0 },
    driverCost: { type: Number, required: true, default: 0 },
    tollCost: { type: Number, required: true, default: 0 },
    profit: { type: Number, required: true, default: 0 }
  },
  pod: {
    signature: { type: String }, // Base64
    photoUrl: { type: String }, // Base64
    deliveredAt: { type: Date },
    receivedBy: { type: String }
  },
  organizationId: { type: String, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const SOSAlertSchema = new Schema<SOSAlertDocument>({
  id: { type: String, required: true, unique: true },
  tripId: { type: String, required: true },
  vehicleId: { type: String, required: true },
  driverId: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const RouteSuggestionSchema = new Schema<RouteSuggestionDocument>({
  id: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  alternativeRoutes: [[{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }]],
  optimizedRoute: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const AlertSchema = new Schema<AlertDocument>({
  id: { type: String, required: true, unique: true },
  tripId: { type: String },
  vehicleId: { type: String },
  driverId: { type: String },
  category: { 
    type: String, 
    enum: ['maintenance', 'fuel_theft', 'route_deviation', 'speeding', 'harsh_braking', 'accident', 'weather_risk', 'traffic_delay', 'idle_time', 'fatigue'], 
    required: true 
  },
  severity: { type: String, enum: ['critical', 'warning', 'info'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const Trip = mongoose.model<TripDocument>('Trip', TripSchema);
export const SOSAlert = mongoose.model<SOSAlertDocument>('SOSAlert', SOSAlertSchema);
export const RouteSuggestion = mongoose.model<RouteSuggestionDocument>('RouteSuggestion', RouteSuggestionSchema);
export const Alert = mongoose.model<AlertDocument>('Alert', AlertSchema);
