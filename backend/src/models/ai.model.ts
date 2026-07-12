import mongoose, { Schema, Document } from 'mongoose';
import { 
  AIPrediction as AIPredictionType, 
  CarbonEmission as CarbonEmissionType, 
  WeatherCache as WeatherCacheType, 
  FleetDNA as FleetDNAType, 
  CompatibilityScore as CompatibilityScoreType, 
  FleetMemory as FleetMemoryType, 
  SimulationHistory as SimulationHistoryType 
} from '../types';

export interface AIPredictionDocument extends Omit<AIPredictionType, 'createdAt' | 'updatedAt'>, Document {}
export interface CarbonEmissionDocument extends Omit<CarbonEmissionType, 'createdAt' | 'updatedAt'>, Document {}
export interface WeatherCacheDocument extends Omit<WeatherCacheType, 'createdAt' | 'updatedAt'>, Document {}
export interface FleetDNADocument extends Omit<FleetDNAType, 'createdAt' | 'updatedAt'>, Document {}
export interface CompatibilityScoreDocument extends Omit<CompatibilityScoreType, 'createdAt' | 'updatedAt'>, Document {}
export interface FleetMemoryDocument extends Omit<FleetMemoryType, 'createdAt' | 'updatedAt'>, Document {}
export interface SimulationHistoryDocument extends Omit<SimulationHistoryType, 'createdAt' | 'updatedAt'>, Document {}

const AIPredictionSchema = new Schema<AIPredictionDocument>({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String },
  driverId: { type: String },
  predictionType: { type: String, enum: ['maintenance', 'compatibility', 'carbon'], required: true },
  predictedValue: { type: String, required: true },
  confidence: { type: Number, required: true },
  details: { type: Schema.Types.Mixed },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const CarbonEmissionSchema = new Schema<CarbonEmissionDocument>({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  tripId: { type: String, required: true },
  fuelConsumed: { type: Number, required: true },
  co2Emissions: { type: Number, required: true },
  environmentalScore: { type: Number, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const WeatherCacheSchema = new Schema<WeatherCacheDocument>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  weatherInfo: { type: String, required: true },
  cachedAt: { type: Date, default: Date.now },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const FleetDNASchema = new Schema<FleetDNADocument>({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true, unique: true },
  profileType: { 
    type: String, 
    enum: ['Workhorse', 'Fuel Saver', 'City Specialist', 'Heavy Duty Expert', 'Premium Performer', 'High Maintenance Asset'],
    required: true 
  },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  riskIndicators: [{ type: String }],
  recommendedUseCases: [{ type: String }],
  retirementRisk: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  lastUpdated: { type: Date, default: Date.now },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const CompatibilityScoreSchema = new Schema<CompatibilityScoreDocument>({
  id: { type: String, required: true, unique: true },
  driverId: { type: String, required: true },
  vehicleId: { type: String, required: true },
  score: { type: Number, required: true },
  compatibilityFactors: {
    historicalPerformance: { type: Number, default: 100 },
    fuelEfficiency: { type: Number, default: 100 },
    deliverySuccess: { type: Number, default: 100 },
    maintenanceIncidents: { type: Number, default: 100 },
    customerRatings: { type: Number, default: 100 }
  },
  recommendations: [{ type: String }],
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const FleetMemorySchema = new Schema<FleetMemoryDocument>({
  id: { type: String, required: true, unique: true },
  patternType: { 
    type: String, 
    enum: ['seasonal_fuel', 'recurring_failure', 'weather_impact', 'driver_behavior', 'vehicle_degradation'], 
    required: true 
  },
  description: { type: String, required: true },
  targetId: { type: String },
  variables: { type: Schema.Types.Mixed },
  confidence: { type: Number, required: true },
  suggestion: { type: String, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const SimulationHistorySchema = new Schema<SimulationHistoryDocument>({
  id: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  simulatedEvents: [{
    type: { type: String, required: true },
    description: { type: String, required: true }
  }],
  metricsImpact: {
    revenueImpactUSD: { type: Number, required: true },
    delayedTripsCount: { type: Number, required: true },
    slaFulfillmentPercent: { type: Number, required: true }
  },
  recoveryPlan: { type: String, required: true },
  createdBy: { type: String, default: null },
  updatedBy: { type: String, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export const AIPrediction = mongoose.model<AIPredictionDocument>('AIPrediction', AIPredictionSchema);
export const CarbonEmission = mongoose.model<CarbonEmissionDocument>('CarbonEmission', CarbonEmissionSchema);
export const WeatherCacheModel = mongoose.model<WeatherCacheDocument>('WeatherCache', WeatherCacheSchema);
export const FleetDNAModel = mongoose.model<FleetDNADocument>('FleetDNA', FleetDNASchema);
export const CompatibilityScoreModel = mongoose.model<CompatibilityScoreDocument>('CompatibilityScore', CompatibilityScoreSchema);
export const FleetMemoryModel = mongoose.model<FleetMemoryDocument>('FleetMemory', FleetMemorySchema);
export const SimulationHistoryModel = mongoose.model<SimulationHistoryDocument>('SimulationHistory', SimulationHistorySchema);
