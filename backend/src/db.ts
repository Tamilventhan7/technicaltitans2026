import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { 
  Vehicle, Driver, Warehouse, Alert, MaintenanceRecord, FuelLog, 
  User, Organization, Insurance, License, SimulationHistoryModel, 
  FleetDNAModel, CompatibilityScoreModel, FleetMemoryModel 
} from './models';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/transitops';

// Local cache for simulation settings when db is resetting or fallback is needed
let localSimulationConfig = {
  fuelPriceMultiplier: 1.0,
  orderVolumeSpike: 0,
  activeDriversUnavailableCount: 0,
  weatherSeverity: 'clear' as 'clear' | 'rain' | 'storm' | 'snow',
  trafficLevel: 'normal' as 'normal' | 'heavy' | 'jammed'
};

// Initial seed details
const initialVehicles = [
  { id: 'TRK-01', plateNumber: 'TX-892A', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 380, fuelEfficiency: 3.5, odometer: 120500, healthScore: 95, telemetry: { engineTemp: 82, oilPressure: 55, batteryVoltage: 14.1 }, gps: { latitude: 41.8781, longitude: -87.6298, speed: 0, heading: 0 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'TRK-02', plateNumber: 'NY-442B', status: 'idle', type: 'Reefer', fuelCapacity: 350, currentFuel: 310, fuelEfficiency: 3.2, odometer: 88400, healthScore: 89, telemetry: { engineTemp: 84, oilPressure: 50, batteryVoltage: 13.8 }, gps: { latitude: 40.7128, longitude: -74.0060, speed: 0, heading: 0 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'TRK-03', plateNumber: 'CA-102C', status: 'idle', type: 'Medium Cargo', fuelCapacity: 250, currentFuel: 240, fuelEfficiency: 4.8, odometer: 45000, healthScore: 92, telemetry: { engineTemp: 79, oilPressure: 52, batteryVoltage: 14.0 }, gps: { latitude: 34.0522, longitude: -118.2437, speed: 0, heading: 0 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'TRK-04', plateNumber: 'TX-771D', status: 'idle', type: 'Sprinter Van', fuelCapacity: 100, currentFuel: 95, fuelEfficiency: 8.5, odometer: 32100, healthScore: 97, telemetry: { engineTemp: 78, oilPressure: 48, batteryVoltage: 14.2 }, gps: { latitude: 32.7767, longitude: -96.7970, speed: 0, heading: 0 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'TRK-05', plateNumber: 'WA-554E', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 350, fuelEfficiency: 3.4, odometer: 145000, healthScore: 84, telemetry: { engineTemp: 86, oilPressure: 45, batteryVoltage: 13.5 }, gps: { latitude: 47.6062, longitude: -122.3321, speed: 0, heading: 0 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'TRK-06', plateNumber: 'IL-910F', status: 'idle', type: 'Reefer', fuelCapacity: 350, currentFuel: 290, fuelEfficiency: 3.1, odometer: 95000, healthScore: 78, telemetry: { engineTemp: 88, oilPressure: 42, batteryVoltage: 13.4 }, gps: { latitude: 41.8781, longitude: -87.6298, speed: 0, heading: 0 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'TRK-07', plateNumber: 'NY-332G', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 120, fuelEfficiency: 3.3, odometer: 210000, healthScore: 54, telemetry: { engineTemp: 98, oilPressure: 38, batteryVoltage: 12.8 }, gps: { latitude: 40.7128, longitude: -74.0060, speed: 0, heading: 0 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'TRK-08', plateNumber: 'CA-993H', status: 'idle', type: 'Medium Cargo', fuelCapacity: 250, currentFuel: 80, fuelEfficiency: 4.5, odometer: 67000, healthScore: 88, telemetry: { engineTemp: 81, oilPressure: 51, batteryVoltage: 13.9 }, gps: { latitude: 34.0522, longitude: -118.2437, speed: 0, heading: 0 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'TRK-09', plateNumber: 'TX-210I', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 390, fuelEfficiency: 3.6, odometer: 12000, healthScore: 99, telemetry: { engineTemp: 80, oilPressure: 58, batteryVoltage: 14.3 }, gps: { latitude: 32.7767, longitude: -96.7970, speed: 0, heading: 0 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'TRK-10', plateNumber: 'WA-808J', status: 'idle', type: 'Sprinter Van', fuelCapacity: 100, currentFuel: 40, fuelEfficiency: 8.2, odometer: 84000, healthScore: 91, telemetry: { engineTemp: 80, oilPressure: 47, batteryVoltage: 13.7 }, gps: { latitude: 47.6062, longitude: -122.3321, speed: 0, heading: 0 }, organizationId: 'ORG-DEFAULT', isDeleted: false }
];

const initialDrivers = [
  { id: 'DRV-01', name: 'James Carter', userId: 'USR-DRV1', licenseNumber: 'DL-TX88910', licenseExpiry: new Date('2028-11-20'), status: 'available', rating: 4.9, safetyScore: 98, activeHoursToday: 0, totalMiles: 154000, gamification: { tier: 'Diamond', points: 14500, badges: ['Eco-Warrior', 'Safety Champion', 'Midnight Runner', 'Fuel Saver'], safeDrivingStreak: 45 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'DRV-02', name: 'Sarah Jenkins', userId: 'USR-DRV2', licenseNumber: 'DL-NY22104', licenseExpiry: new Date('2027-04-12'), status: 'available', rating: 4.8, safetyScore: 95, activeHoursToday: 0, totalMiles: 98000, gamification: { tier: 'Gold', points: 9200, badges: ['Customer Favorite', 'On-Time Master', 'Safety Champion'], safeDrivingStreak: 28 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'DRV-03', name: 'Marcus Vance', userId: 'USR-DRV3', licenseNumber: 'DL-CA99238', licenseExpiry: new Date('2026-09-30'), status: 'available', rating: 4.7, safetyScore: 92, activeHoursToday: 0, totalMiles: 112000, gamification: { tier: 'Gold', points: 8400, badges: ['Route Explorer', 'Eco-Warrior'], safeDrivingStreak: 15 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'DRV-04', name: 'Carlos Gomez', userId: 'USR-DRV4', licenseNumber: 'DL-TX55210', licenseExpiry: new Date('2027-10-15'), status: 'available', rating: 4.2, safetyScore: 72, activeHoursToday: 0, totalMiles: 48000, gamification: { tier: 'Bronze', points: 2100, badges: ['Speedy Starter'], safeDrivingStreak: 2 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'DRV-05', name: 'Emily Taylor', userId: 'USR-DRV5', licenseNumber: 'DL-WA33490', licenseExpiry: new Date('2028-07-28'), status: 'available', rating: 4.6, safetyScore: 89, activeHoursToday: 0, totalMiles: 65000, gamification: { tier: 'Silver', points: 5800, badges: ['On-Time Master'], safeDrivingStreak: 9 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'DRV-06', name: 'Robert Chen', userId: 'USR-DRV6', licenseNumber: 'DL-IL40412', licenseExpiry: new Date('2029-01-05'), status: 'available', rating: 4.9, safetyScore: 96, activeHoursToday: 0, totalMiles: 82000, gamification: { tier: 'Gold', points: 9900, badges: ['Eco-Warrior', 'Safety Champion', 'On-Time Master'], safeDrivingStreak: 34 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'DRV-07', name: 'David Miller', userId: 'USR-DRV7', licenseNumber: 'DL-NY77319', licenseExpiry: new Date('2028-06-18'), status: 'available', rating: 4.5, safetyScore: 85, activeHoursToday: 0, totalMiles: 135000, gamification: { tier: 'Silver', points: 6400, badges: ['Route Explorer', 'Midnight Runner'], safeDrivingStreak: 12 }, organizationId: 'ORG-DEFAULT', isDeleted: false },
  { id: 'DRV-08', name: 'Lisa Anderson', userId: 'USR-DRV8', licenseNumber: 'DL-CA11029', licenseExpiry: new Date('2027-08-22'), status: 'available', rating: 4.7, safetyScore: 91, activeHoursToday: 0, totalMiles: 73000, gamification: { tier: 'Gold', points: 7900, badges: ['Customer Favorite', 'Eco-Warrior'], safeDrivingStreak: 18 }, organizationId: 'ORG-DEFAULT', isDeleted: false }
];

const initialWarehouses = [
  { id: 'WH-CHI', name: 'Chicago Logistic Hub', location: { lat: 41.8781, lng: -87.6298 }, capacity: 1500, inventoryLevel: 1120, incomingShipments: 8, outgoingShipments: 12, isDeleted: false },
  { id: 'WH-NYC', name: 'New York Port Depot', location: { lat: 40.7128, lng: -74.0060 }, capacity: 2000, inventoryLevel: 1450, incomingShipments: 15, outgoingShipments: 18, isDeleted: false },
  { id: 'WH-LAX', name: 'Los Angeles Freight Terminal', location: { lat: 34.0522, lng: -118.2437 }, capacity: 1800, inventoryLevel: 980, incomingShipments: 6, outgoingShipments: 7, isDeleted: false },
  { id: 'WH-DFW', name: 'Dallas Dispatch Yard', location: { lat: 32.7767, lng: -96.7970 }, capacity: 1200, inventoryLevel: 800, incomingShipments: 10, outgoingShipments: 11, isDeleted: false },
  { id: 'WH-SEA', name: 'Seattle Port Gateway', location: { lat: 47.6062, lng: -122.3321 }, capacity: 1000, inventoryLevel: 620, incomingShipments: 4, outgoingShipments: 5, isDeleted: false }
];

export let isDbConnected = false;
let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDb(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    
    // First, try connecting to standard MONGODB_URI
    console.log(`Attempting connection to MONGODB_URI: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    isDbConnected = true;
    console.log('TransitOps Mongoose Database connection established.');
  } catch (err) {
    console.warn('\n⚠️ [Database Warning] Local MongoDB connection failed. Booting In-Memory MongoDB Fallback...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      
      await mongoose.connect(inMemoryUri);
      isDbConnected = true;
      console.log('TransitOps In-Memory Database connection established (Zero-Config Active).');
    } catch (memErr) {
      isDbConnected = false;
      console.error('CRITICAL: Mongoose Database connection and In-Memory fallback failed:', memErr);
    }
  }

  if (isDbConnected) {
    // Seed checking
    try {
      const vehicleCount = await Vehicle.countDocuments();
      if (vehicleCount === 0) {
        console.log('Seeding initial MongoDB dataset...');
        await seedDatabase();
      }
    } catch (seedErr) {
      console.error('Error seeding database:', seedErr);
    }
  }
}

export async function getSimulationConfig() {
  return localSimulationConfig;
}

export async function saveSimulationConfig(config: any) {
  localSimulationConfig = { ...localSimulationConfig, ...config };
}

export async function seedDatabase() {
  await Organization.deleteMany({});
  await User.deleteMany({});
  await Vehicle.deleteMany({});
  await Driver.deleteMany({});
  await Warehouse.deleteMany({});
  await Alert.deleteMany({});
  await MaintenanceRecord.deleteMany({});
  await FuelLog.deleteMany({});
  await Insurance.deleteMany({});
  await License.deleteMany({});
  await SimulationHistoryModel.deleteMany({});
  await FleetDNAModel.deleteMany({});
  await CompatibilityScoreModel.deleteMany({});
  await FleetMemoryModel.deleteMany({});

  await Organization.create({
    id: 'ORG-DEFAULT',
    name: 'TransitOps Global Logistics',
    subscriptionTier: 'Enterprise',
    status: 'active',
    isDeleted: false
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin', salt);
  
  await User.create([
    { id: 'USR-ADMIN', username: 'admin', email: 'admin@transitops.com', passwordHash, role: 'Admin', organizationId: 'ORG-DEFAULT', isDeleted: false },
    { id: 'USR-OPERATOR', username: 'operator', email: 'operator@transitops.com', passwordHash, role: 'Dispatcher', organizationId: 'ORG-DEFAULT', isDeleted: false },
    { id: 'USR-DRIVER', username: 'driver', email: 'driver@transitops.com', passwordHash, role: 'Driver', organizationId: 'ORG-DEFAULT', isDeleted: false },
    { id: 'USR-CUSTOMER', username: 'customer', email: 'customer@transitops.com', passwordHash, role: 'Dispatcher', organizationId: 'ORG-DEFAULT', isDeleted: false }
  ]);

  await Vehicle.insertMany(initialVehicles);
  await Driver.insertMany(initialDrivers);
  await Warehouse.insertMany(initialWarehouses);

  const insurancePolicies = initialVehicles.map((vehicle, idx) => ({
    id: `INS-${vehicle.id}`,
    vehicleId: vehicle.id,
    provider: idx % 2 === 0 ? 'Geico Commercial' : 'Progressive Fleet',
    policyNumber: `POL-${100000 + idx * 452}`,
    coverageAmount: 500000,
    startDate: new Date('2025-01-01'),
    expiryDate: new Date('2028-12-31'),
    isDeleted: false
  }));
  await Insurance.insertMany(insurancePolicies);

  const driverLicenses = initialDrivers.map((driver, idx) => ({
    id: `LIC-${driver.id}`,
    driverId: driver.id,
    licenseNumber: driver.licenseNumber,
    expiryDate: driver.licenseExpiry,
    classType: 'Class A CDL',
    isDeleted: false
  }));
  await License.insertMany(driverLicenses);

  await Alert.create([
    { id: 'AL-101', vehicleId: 'TRK-07', category: 'maintenance', severity: 'warning', message: 'Engine Temperature High (98°C). Maintenance recommended.', timestamp: new Date(Date.now() - 3600000), resolved: false, isDeleted: false },
    { id: 'AL-102', driverId: 'DRV-03', category: 'maintenance', severity: 'info', message: 'Driver License DL-CA99238 expires soon.', timestamp: new Date(Date.now() - 7200000), resolved: false, isDeleted: false }
  ]);

  await MaintenanceRecord.create([
    { id: 'MT-01', vehicleId: 'TRK-01', date: new Date('2026-06-15'), type: 'Routine Oil Change', cost: 150, status: 'completed', notes: 'Full synthetic oil change.', partsReplaced: ['Oil Filter', 'Engine Oil'], isDeleted: false },
    { id: 'MT-02', vehicleId: 'TRK-05', date: new Date('2026-07-02'), type: 'Brake Replacement', cost: 650, status: 'completed', notes: 'Replaced brake pads.', partsReplaced: ['Brake Pads'], isDeleted: false }
  ]);

  await FuelLog.create([
    { id: 'FL-01', vehicleId: 'TRK-01', driverId: 'DRV-01', date: new Date('2026-07-10'), liters: 120, cost: 180, station: 'Pilot Flying J #442', odometer: 120500, theftDetected: false, isDeleted: false }
  ]);

  console.log('TransitOps database initialized and fully seeded.');
}

export async function resetDatabase(): Promise<void> {
  await seedDatabase();
  console.log('Database state reset to default configurations.');
}
