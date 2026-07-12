export interface BaseSchema {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
}

export type UserRole = 'Admin' | 'Fleet Manager' | 'Dispatcher' | 'Driver' | 'Safety Officer' | 'Financial Analyst';

export interface User extends BaseSchema {
  id: string; // USR-1234
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  organizationId: string;
  otp?: string;
  otpExpiry?: Date;
  refreshToken?: string;
}

export interface Organization extends BaseSchema {
  id: string; // ORG-1234
  name: string;
  subscriptionTier: 'Standard' | 'Enterprise';
  status: 'active' | 'suspended';
}

export interface GPSCoordinate {
  lat: number;
  lng: number;
}

export interface VehicleTelemetry {
  engineTemp: number;
  oilPressure: number;
  batteryVoltage: number;
}

export interface VehicleGPS {
  latitude: number;
  longitude: number;
  speed: number; // KM/H
  heading: number; // Degrees
}

export interface Vehicle extends BaseSchema {
  id: string; // TRK-01
  plateNumber: string;
  status: 'idle' | 'in-transit' | 'maintenance' | 'out-of-service';
  type: 'Heavy Duty Truck' | 'Reefer' | 'Medium Cargo' | 'Sprinter Van';
  fuelCapacity: number; // Liters
  currentFuel: number; // Liters
  fuelEfficiency: number; // KM/L
  odometer: number; // KM
  healthScore: number; // 0-100
  telemetry: VehicleTelemetry;
  gps: VehicleGPS;
  documentIds: string[];
  organizationId: string;
}

export interface DriverGamification {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  points: number;
  badges: string[];
  safeDrivingStreak: number; // Days
}

export interface Driver extends BaseSchema {
  id: string; // DRV-01
  userId: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: Date;
  status: 'available' | 'driving' | 'resting' | 'sick' | 'suspended';
  rating: number; // 1.0 - 5.0
  safetyScore: number; // 0-100
  activeHoursToday: number;
  totalMiles: number;
  gamification: DriverGamification;
  organizationId: string;
}

export interface TelemetryLogs {
  timestamp: string;
  lat: number;
  lng: number;
  speed: number;
  fuelRemaining: number;
}

export interface Financials {
  revenue: number;
  cost: number;
  fuelCost: number;
  driverCost: number;
  tollCost: number;
  profit: number;
}

export interface ProofOfDelivery {
  signature: string; // Base64 signature
  photoUrl: string; // Base64 photo
  deliveredAt: Date;
  receivedBy: string;
}

export interface Trip extends BaseSchema {
  id: string; // TRIP-101
  orderId: string;
  vehicleId: string;
  driverId: string;
  origin: { name: string } & GPSCoordinate;
  destination: { name: string } & GPSCoordinate;
  status: 'pending' | 'dispatched' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled';
  cargoType: string;
  cargoWeight: number; // KG
  departureTime: Date;
  estimatedArrivalTime: Date;
  actualArrivalTime?: Date;
  route: GPSCoordinate[];
  currentRouteIndex: number;
  telemetryLogs: TelemetryLogs[];
  alertsTriggered: string[];
  financials: Financials;
  pod?: ProofOfDelivery;
  organizationId: string;
}

export interface TripStop extends BaseSchema {
  id: string;
  tripId: string;
  name: string;
  location: GPSCoordinate;
  sequence: number;
  status: 'pending' | 'arrived' | 'departed';
  scheduledTime: Date;
  actualTime?: Date;
}

export interface FuelLog extends BaseSchema {
  id: string;
  vehicleId: string;
  driverId: string;
  date: Date;
  liters: number;
  cost: number;
  station: string;
  odometer: number;
  theftDetected: boolean;
}

export interface MaintenanceRecord extends BaseSchema {
  id: string;
  vehicleId: string;
  date: Date;
  type: 'Routine Oil Change' | 'Brake Replacement' | 'Engine Overhaul' | 'Tire Rotation' | 'Sensor Calibration';
  cost: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  notes: string;
  partsReplaced: string[];
}

export interface Expense extends BaseSchema {
  id: string;
  organizationId: string;
  category: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  date: Date;
}

export interface Invoice extends BaseSchema {
  id: string;
  tripId: string;
  organizationId: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  issueDate: Date;
  dueDate: Date;
}

export interface Reward extends BaseSchema {
  id: string;
  driverId: string;
  description: string;
  pointsCost: number;
  claimedAt: Date;
}

export interface Leaderboard extends BaseSchema {
  id: string;
  driverId: string;
  driverName: string;
  safetyScore: number;
  points: number;
  rank: number;
  period: string; // e.g. "Monthly-2026-07"
}

export interface Notification extends BaseSchema {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  readStatus: boolean;
  timestamp: Date;
}

export interface Document extends BaseSchema {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  expiryDate?: Date;
  status: 'valid' | 'expired' | 'pending_review';
}

export interface Insurance extends BaseSchema {
  id: string;
  vehicleId: string;
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  startDate: Date;
  expiryDate: Date;
}

export interface License extends BaseSchema {
  id: string;
  driverId: string;
  licenseNumber: string;
  expiryDate: Date;
  classType: string;
}

export interface AIPrediction extends BaseSchema {
  id: string;
  vehicleId?: string;
  driverId?: string;
  predictionType: 'maintenance' | 'compatibility' | 'carbon';
  predictedValue: string;
  confidence: number; // 0 - 100
  details: any;
}

export interface SOSAlert extends BaseSchema {
  id: string;
  tripId: string;
  vehicleId: string;
  driverId: string;
  message: string;
  status: 'active' | 'resolved';
  coordinates: GPSCoordinate;
}

export interface ActivityLog extends BaseSchema {
  id: string;
  userId: string;
  action: string;
  details: string;
}

export interface AuditLog extends BaseSchema {
  id: string;
  resourceType: string;
  resourceId: string;
  action: string;
  performedBy: string; // user id
  oldState?: any;
  newState?: any;
  ipAddress?: string;
}

export interface Report extends BaseSchema {
  id: string;
  title: string;
  type: 'PDF' | 'Excel' | 'CSV';
  fileUrl: string;
  generatedBy: string;
}

export interface CarbonEmission extends BaseSchema {
  id: string;
  vehicleId: string;
  tripId: string;
  fuelConsumed: number;
  co2Emissions: number; // KG
  environmentalScore: number;
}

export interface WeatherCache extends BaseSchema {
  lat: number;
  lng: number;
  weatherInfo: string;
  cachedAt: Date;
}

export interface RouteSuggestion extends BaseSchema {
  id: string;
  origin: string;
  destination: string;
  alternativeRoutes: GPSCoordinate[][];
  optimizedRoute: GPSCoordinate[];
}

export interface ChatMessage extends BaseSchema {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
}

export interface FleetDNA extends BaseSchema {
  id: string;
  vehicleId: string;
  profileType: 'Workhorse' | 'Fuel Saver' | 'City Specialist' | 'Heavy Duty Expert' | 'Premium Performer' | 'High Maintenance Asset';
  strengths: string[];
  weaknesses: string[];
  riskIndicators: string[];
  recommendedUseCases: string[];
  retirementRisk: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

export interface CompatibilityScore extends BaseSchema {
  id: string;
  driverId: string;
  vehicleId: string;
  score: number;
  compatibilityFactors: {
    historicalPerformance: number;
    fuelEfficiency: number;
    deliverySuccess: number;
    maintenanceIncidents: number;
    customerRatings: number;
  };
  recommendations: string[];
}

export interface FleetMemory extends BaseSchema {
  id: string;
  patternType: 'seasonal_fuel' | 'recurring_failure' | 'weather_impact' | 'driver_behavior' | 'vehicle_degradation';
  description: string;
  targetId?: string; // vehicleId or driverId or generic
  variables: any;
  confidence: number;
  suggestion: string;
}

export interface SimulationHistory extends BaseSchema {
  id: string;
  timestamp: Date;
  simulatedEvents: {
    type: string;
    description: string;
  }[];
  metricsImpact: {
    revenueImpactUSD: number;
    delayedTripsCount: number;
    slaFulfillmentPercent: number;
  };
  recoveryPlan: string;
}

export interface SimulationConfig {
  fuelPriceMultiplier: number;
  orderVolumeSpike: number;
  activeDriversUnavailableCount: number;
  weatherSeverity: 'clear' | 'rain' | 'storm' | 'snow';
  trafficLevel: 'normal' | 'heavy' | 'jammed';
}

export interface Alert extends BaseSchema {
  id: string;
  tripId?: string;
  vehicleId?: string;
  driverId?: string;
  category: 'maintenance' | 'fuel_theft' | 'route_deviation' | 'speeding' | 'harsh_braking' | 'accident' | 'weather_risk' | 'traffic_delay' | 'idle_time' | 'fatigue';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
  location?: GPSCoordinate;
}

export interface Warehouse extends BaseSchema {
  id: string;
  name: string;
  location: GPSCoordinate;
  capacity: number;
  inventoryLevel: number;
  incomingShipments: number;
  outgoingShipments: number;
}


