export interface GPSCoordinate {
  lat: number;
  lng: number;
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
  signature: string; // Base64 Canvas Drawing
  photoUrl: string; // Base64 Mock Photo
  deliveredAt: string;
  receivedBy: string;
}

export interface VehicleTelemetry {
  engineTemp: number;
  oilPressure: number;
  batteryVoltage: number;
}

export interface Vehicle {
  id: string; // e.g. TRK-01
  plateNumber: string;
  status: 'idle' | 'in-transit' | 'maintenance' | 'out-of-service';
  type: 'Heavy Duty Truck' | 'Reefer' | 'Medium Cargo' | 'Sprinter Van';
  fuelCapacity: number; // Liters
  currentFuel: number; // Liters
  fuelEfficiency: number; // KM/L
  odometer: number; // KM
  healthScore: number; // 0-100
  telemetry: VehicleTelemetry;
  gps: {
    latitude: number;
    longitude: number;
    speed: number; // KM/H
    heading: number; // Degrees
  };

  // Mongoose fields
  assignedDriver?: string;
  assignedTrip?: string;
  insuranceExpiry?: string;
  fitnessExpiry?: string;
  pollutionExpiry?: string;
}

export interface DriverGamification {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Elite';
  points: number;
  badges: string[];
  safeDrivingStreak: number; // Days
}

export interface Driver {
  id: string; // e.g. DRV-01
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'available' | 'driving' | 'resting' | 'sick' | 'suspended';
  rating: number; // 1.0 - 5.0
  safetyScore: number; // 0-100
  activeHoursToday: number;
  totalMiles: number;
  gamification: DriverGamification;

  // Mongoose fields
  bloodGroup?: string;
  phone?: string;
  email?: string;
  joiningDate?: string;
  salary?: number;
  experience?: number;
}

export interface Trip {
  id: string; // e.g. TRIP-101
  orderId: string;
  vehicleId: string;
  driverId: string;
  origin: { name: string } & GPSCoordinate;
  destination: { name: string } & GPSCoordinate;
  status: 'pending' | 'dispatched' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled';
  cargoType: string;
  cargoWeight: number; // KG
  departureTime: string;
  estimatedArrivalTime: string;
  actualArrivalTime?: string;
  route: GPSCoordinate[];
  currentRouteIndex: number;
  telemetryLogs: TelemetryLogs[];
  alertsTriggered: string[];
  financials: Financials;
  pod?: ProofOfDelivery;

  // Mongoose fields
  fuelUsed?: number;
  expenses?: number;
}

export interface Alert {
  id: string;
  tripId?: string;
  vehicleId?: string;
  driverId?: string;
  category: 'maintenance' | 'fuel_theft' | 'route_deviation' | 'speeding' | 'harsh_braking' | 'accident' | 'weather_risk' | 'traffic_delay' | 'idle_time' | 'fatigue' | 'sos';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
  location?: GPSCoordinate;
}

export interface Warehouse {
  id: string;
  name: string;
  location: GPSCoordinate;
  capacity: number; // Pallet spots
  inventoryLevel: number;
  incomingShipments: number;
  outgoingShipments: number;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  date: string;
  type: 'Routine Oil Change' | 'Brake Replacement' | 'Engine Overhaul' | 'Tire Rotation' | 'Sensor Calibration';
  cost: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  notes: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
  station: string;
  theftDetected: boolean;
}

export interface SimulationConfig {
  fuelPriceMultiplier: number;
  orderVolumeSpike: number;
  activeDriversUnavailableCount: number;
  weatherSeverity: 'clear' | 'rain' | 'storm' | 'snow';
  trafficLevel: 'normal' | 'heavy' | 'jammed';
}

export interface SimulationKpis {
  activeTripsCount: number;
  completedTripsCount: number;
  totalRevenue: number;
  totalProfit: number;
  fleetHealthAvg: number;
  carbonEmissionsKG: number;
  multiplier: number;
}

export interface DispatchRecommendation {
  driver: Driver;
  vehicle: Vehicle;
  route: GPSCoordinate[];
  estimatedDistanceKM: number;
  estimatedDurationHours: number;
  expectedFuelLiters: number;
  expectedCostUSD: number;
  expectedRevenueUSD: number;
  expectedProfitUSD: number;
  matchScore: number;
  reasoning: string;
}
