import fs from 'fs';
import path from 'path';
import { MongoClient, Db } from 'mongodb';
import { Vehicle, Driver, Trip, Alert, Warehouse, MaintenanceLog, FuelRecord, SimulationConfig } from './types';

const useMongo = !!process.env.MONGODB_URI;
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

const DATA_DIR = path.join(__dirname, '..', 'data');
const JSON_DB_PATH = path.join(DATA_DIR, 'db.json');

// Initial seed data
const initialSeed = {
  vehicles: [
    { id: 'TRK-01', plateNumber: 'TX-892A', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 380, fuelEfficiency: 3.5, odometer: 120500, healthScore: 95, telemetry: { engineTemp: 82, oilPressure: 55, batteryVoltage: 14.1 }, gps: { latitude: 41.8781, longitude: -87.6298, speed: 0, heading: 0 } }, // Chicago
    { id: 'TRK-02', plateNumber: 'NY-442B', status: 'idle', type: 'Reefer', fuelCapacity: 350, currentFuel: 310, fuelEfficiency: 3.2, odometer: 88400, healthScore: 89, telemetry: { engineTemp: 84, oilPressure: 50, batteryVoltage: 13.8 }, gps: { latitude: 40.7128, longitude: -74.0060, speed: 0, heading: 0 } }, // NY
    { id: 'TRK-03', plateNumber: 'CA-102C', status: 'idle', type: 'Medium Cargo', fuelCapacity: 250, currentFuel: 240, fuelEfficiency: 4.8, odometer: 45000, healthScore: 92, telemetry: { engineTemp: 79, oilPressure: 52, batteryVoltage: 14.0 }, gps: { latitude: 34.0522, longitude: -118.2437, speed: 0, heading: 0 } }, // LA
    { id: 'TRK-04', plateNumber: 'TX-771D', status: 'idle', type: 'Sprinter Van', fuelCapacity: 100, currentFuel: 95, fuelEfficiency: 8.5, odometer: 32100, healthScore: 97, telemetry: { engineTemp: 78, oilPressure: 48, batteryVoltage: 14.2 }, gps: { latitude: 32.7767, longitude: -96.7970, speed: 0, heading: 0 } }, // Dallas
    { id: 'TRK-05', plateNumber: 'WA-554E', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 350, fuelEfficiency: 3.4, odometer: 145000, healthScore: 84, telemetry: { engineTemp: 86, oilPressure: 45, batteryVoltage: 13.5 }, gps: { latitude: 47.6062, longitude: -122.3321, speed: 0, heading: 0 } }, // Seattle
    { id: 'TRK-06', plateNumber: 'IL-910F', status: 'idle', type: 'Reefer', fuelCapacity: 350, currentFuel: 290, fuelEfficiency: 3.1, odometer: 95000, healthScore: 78, telemetry: { engineTemp: 88, oilPressure: 42, batteryVoltage: 13.4 }, gps: { latitude: 41.8781, longitude: -87.6298, speed: 0, heading: 0 } },
    { id: 'TRK-07', plateNumber: 'NY-332G', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 120, fuelEfficiency: 3.3, odometer: 210000, healthScore: 54, telemetry: { engineTemp: 98, oilPressure: 38, batteryVoltage: 12.8 }, gps: { latitude: 40.7128, longitude: -74.0060, speed: 0, heading: 0 } }, // low health / low fuel
    { id: 'TRK-08', plateNumber: 'CA-993H', status: 'idle', type: 'Medium Cargo', fuelCapacity: 250, currentFuel: 80, fuelEfficiency: 4.5, odometer: 67000, healthScore: 88, telemetry: { engineTemp: 81, oilPressure: 51, batteryVoltage: 13.9 }, gps: { latitude: 34.0522, longitude: -118.2437, speed: 0, heading: 0 } },
    { id: 'TRK-09', plateNumber: 'TX-210I', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 390, fuelEfficiency: 3.6, odometer: 12000, healthScore: 99, telemetry: { engineTemp: 80, oilPressure: 58, batteryVoltage: 14.3 }, gps: { latitude: 32.7767, longitude: -96.7970, speed: 0, heading: 0 } },
    { id: 'TRK-10', plateNumber: 'WA-808J', status: 'idle', type: 'Sprinter Van', fuelCapacity: 100, currentFuel: 40, fuelEfficiency: 8.2, odometer: 84000, healthScore: 91, telemetry: { engineTemp: 80, oilPressure: 47, batteryVoltage: 13.7 }, gps: { latitude: 47.6062, longitude: -122.3321, speed: 0, heading: 0 } }
  ] as Vehicle[],
  drivers: [
    { id: 'DRV-01', name: 'James Carter', licenseNumber: 'DL-TX88910', licenseExpiry: '2028-11-20', status: 'available', rating: 4.9, safetyScore: 98, activeHoursToday: 0, totalMiles: 154000, gamification: { tier: 'Diamond', points: 14500, badges: ['Eco-Warrior', 'Safety Champion', 'Midnight Runner', 'Fuel Saver'], safeDrivingStreak: 45 } },
    { id: 'DRV-02', name: 'Sarah Jenkins', licenseNumber: 'DL-NY22104', licenseExpiry: '2027-04-12', status: 'available', rating: 4.8, safetyScore: 95, activeHoursToday: 0, totalMiles: 98000, gamification: { tier: 'Gold', points: 9200, badges: ['Customer Favorite', 'On-Time Master', 'Safety Champion'], safeDrivingStreak: 28 } },
    { id: 'DRV-03', name: 'Marcus Vance', licenseNumber: 'DL-CA99238', licenseExpiry: '2026-09-30', status: 'available', rating: 4.7, safetyScore: 92, activeHoursToday: 0, totalMiles: 112000, gamification: { tier: 'Gold', points: 8400, badges: ['Route Explorer', 'Eco-Warrior'], safeDrivingStreak: 15 } },
    { id: 'DRV-04', name: 'Carlos Gomez', licenseNumber: 'DL-TX55210', licenseExpiry: '2027-10-15', status: 'available', rating: 4.2, safetyScore: 72, activeHoursToday: 0, totalMiles: 48000, gamification: { tier: 'Bronze', points: 2100, badges: ['Speedy Starter'], safeDrivingStreak: 2 } }, // low score
    { id: 'DRV-05', name: 'Emily Taylor', licenseNumber: 'DL-WA33490', licenseExpiry: '2026-07-28', status: 'available', rating: 4.6, safetyScore: 89, activeHoursToday: 0, totalMiles: 65000, gamification: { tier: 'Silver', points: 5800, badges: ['On-Time Master'], safeDrivingStreak: 9 } }, // expiry soon
    { id: 'DRV-06', name: 'Robert Chen', licenseNumber: 'DL-IL40412', licenseExpiry: '2029-01-05', status: 'available', rating: 4.9, safetyScore: 96, activeHoursToday: 0, totalMiles: 82000, gamification: { tier: 'Gold', points: 9900, badges: ['Eco-Warrior', 'Safety Champion', 'On-Time Master'], safeDrivingStreak: 34 } },
    { id: 'DRV-07', name: 'David Miller', licenseNumber: 'DL-NY77319', licenseExpiry: '2028-06-18', status: 'available', rating: 4.5, safetyScore: 85, activeHoursToday: 0, totalMiles: 135000, gamification: { tier: 'Silver', points: 6400, badges: ['Route Explorer', 'Midnight Runner'], safeDrivingStreak: 12 } },
    { id: 'DRV-08', name: 'Lisa Anderson', licenseNumber: 'DL-CA11029', licenseExpiry: '2027-08-22', status: 'available', rating: 4.7, safetyScore: 91, activeHoursToday: 0, totalMiles: 73000, gamification: { tier: 'Gold', points: 7900, badges: ['Customer Favorite', 'Eco-Warrior'], safeDrivingStreak: 18 } }
  ] as Driver[],
  warehouses: [
    { id: 'WH-CHI', name: 'Chicago Logistic Hub', location: { lat: 41.8781, lng: -87.6298 }, capacity: 1500, inventoryLevel: 1120, incomingShipments: 8, outgoingShipments: 12 },
    { id: 'WH-NYC', name: 'New York Port Depot', location: { lat: 40.7128, lng: -74.0060 }, capacity: 2000, inventoryLevel: 1450, incomingShipments: 15, outgoingShipments: 18 },
    { id: 'WH-LAX', name: 'Los Angeles Freight Terminal', location: { lat: 34.0522, lng: -118.2437 }, capacity: 1800, inventoryLevel: 980, incomingShipments: 6, outgoingShipments: 7 },
    { id: 'WH-DFW', name: 'Dallas Dispatch Yard', location: { lat: 32.7767, lng: -96.7970 }, capacity: 1200, inventoryLevel: 800, incomingShipments: 10, outgoingShipments: 11 },
    { id: 'WH-SEA', name: 'Seattle Port Gateway', location: { lat: 47.6062, lng: -122.3321 }, capacity: 1000, inventoryLevel: 620, incomingShipments: 4, outgoingShipments: 5 }
  ] as Warehouse[],
  trips: [] as Trip[],
  alerts: [
    { id: 'AL-101', vehicleId: 'TRK-07', category: 'maintenance', severity: 'warning', message: 'Engine Temperature High (98°C). Maintenance recommended.', timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: false },
    { id: 'AL-102', driverId: 'DRV-05', category: 'maintenance', severity: 'info', message: 'Driver License DL-WA33490 expires in 16 days.', timestamp: new Date(Date.now() - 7200000).toISOString(), resolved: false }
  ] as Alert[],
  maintenanceLogs: [
    { id: 'MT-01', vehicleId: 'TRK-01', date: '2026-06-15', type: 'Routine Oil Change', cost: 150, status: 'completed', notes: 'Full synthetic oil and filter change. All fluids topped off.' },
    { id: 'MT-02', vehicleId: 'TRK-05', date: '2026-07-02', type: 'Brake Replacement', cost: 650, status: 'completed', notes: 'Replaced front and rear brake pads, turned rotors.' },
    { id: 'MT-03', vehicleId: 'TRK-07', date: '2026-07-18', type: 'Engine Overhaul', cost: 2400, status: 'scheduled', notes: 'Investigate overheating issues and low oil pressure warnings.' }
  ] as MaintenanceLog[],
  fuelRecords: [
    { id: 'FL-01', vehicleId: 'TRK-01', date: '2026-07-10', liters: 120, cost: 180, station: 'Pilot Flying J #442', theftDetected: false },
    { id: 'FL-02', vehicleId: 'TRK-03', date: '2026-07-11', liters: 80, cost: 128, station: 'Love\'s Travel Stop #108', theftDetected: false }
  ] as FuelRecord[],
  simulationConfig: {
    fuelPriceMultiplier: 1.0,
    orderVolumeSpike: 0,
    activeDriversUnavailableCount: 0,
    weatherSeverity: 'clear',
    trafficLevel: 'normal'
  } as SimulationConfig
};

// Ensure JSON file directory exists
if (!useMongo) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(JSON_DB_PATH)) {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialSeed, null, 2));
  }
}

// Memory database copy for local JSON fallback
let localDbState = !useMongo ? JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf-8')) : null;

// Local DB Save Helper
function saveLocalDb() {
  if (!useMongo && localDbState) {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(localDbState, null, 2));
  }
}

export async function connectDb(): Promise<void> {
  if (useMongo) {
    try {
      mongoClient = new MongoClient(process.env.MONGODB_URI!);
      await mongoClient.connect();
      mongoDb = mongoClient.db();
      console.log('MongoDB connection established successfully.');

      // Check if seeded
      const collectionNames = (await mongoDb.listCollections().toArray()).map(c => c.name);
      if (!collectionNames.includes('vehicles') || (await mongoDb.collection('vehicles').countDocuments()) === 0) {
        console.log('Seeding MongoDB...');
        await mongoDb.collection('vehicles').insertMany(initialSeed.vehicles);
        await mongoDb.collection('drivers').insertMany(initialSeed.drivers);
        await mongoDb.collection('warehouses').insertMany(initialSeed.warehouses);
        await mongoDb.collection('alerts').insertMany(initialSeed.alerts);
        await mongoDb.collection('maintenanceLogs').insertMany(initialSeed.maintenanceLogs);
        await mongoDb.collection('fuelRecords').insertMany(initialSeed.fuelRecords);
        await mongoDb.collection('simulationConfig').insertOne(initialSeed.simulationConfig);
      }
    } catch (err) {
      console.error('Failed to connect to MongoDB, running with local JSON DB fallback.', err);
      // Fallback
      localDbState = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf-8'));
    }
  } else {
    console.log('Running application in Local JSON-file Fallback mode.');
  }
}

export async function getVehicles(): Promise<Vehicle[]> {
  if (mongoDb && useMongo) return mongoDb.collection<Vehicle>('vehicles').find().toArray();
  return localDbState.vehicles;
}

export async function saveVehicle(vehicle: Vehicle): Promise<void> {
  if (mongoDb && useMongo) {
    await mongoDb.collection('vehicles').replaceOne({ id: vehicle.id }, vehicle, { upsert: true });
    return;
  }
  const idx = localDbState.vehicles.findIndex((v: any) => v.id === vehicle.id);
  if (idx > -1) localDbState.vehicles[idx] = vehicle;
  else localDbState.vehicles.push(vehicle);
  saveLocalDb();
}

export async function getDrivers(): Promise<Driver[]> {
  if (mongoDb && useMongo) return mongoDb.collection<Driver>('drivers').find().toArray();
  return localDbState.drivers;
}

export async function saveDriver(driver: Driver): Promise<void> {
  if (mongoDb && useMongo) {
    await mongoDb.collection('drivers').replaceOne({ id: driver.id }, driver, { upsert: true });
    return;
  }
  const idx = localDbState.drivers.findIndex((d: any) => d.id === driver.id);
  if (idx > -1) localDbState.drivers[idx] = driver;
  else localDbState.drivers.push(driver);
  saveLocalDb();
}

export async function getTrips(): Promise<Trip[]> {
  if (mongoDb && useMongo) return mongoDb.collection<Trip>('trips').find().toArray();
  return localDbState.trips;
}

export async function saveTrip(trip: Trip): Promise<void> {
  if (mongoDb && useMongo) {
    await mongoDb.collection('trips').replaceOne({ id: trip.id }, trip, { upsert: true });
    return;
  }
  const idx = localDbState.trips.findIndex((t: any) => t.id === trip.id);
  if (idx > -1) localDbState.trips[idx] = trip;
  else localDbState.trips.push(trip);
  saveLocalDb();
}

export async function getAlerts(): Promise<Alert[]> {
  if (mongoDb && useMongo) return mongoDb.collection<Alert>('alerts').find().toArray();
  return localDbState.alerts;
}

export async function saveAlert(alert: Alert): Promise<void> {
  if (mongoDb && useMongo) {
    await mongoDb.collection('alerts').replaceOne({ id: alert.id }, alert, { upsert: true });
    return;
  }
  const idx = localDbState.alerts.findIndex((a: any) => a.id === alert.id);
  if (idx > -1) localDbState.alerts[idx] = alert;
  else localDbState.alerts.push(alert);
  saveLocalDb();
}

export async function getWarehouses(): Promise<Warehouse[]> {
  if (mongoDb && useMongo) return mongoDb.collection<Warehouse>('warehouses').find().toArray();
  return localDbState.warehouses;
}

export async function saveWarehouse(warehouse: Warehouse): Promise<void> {
  if (mongoDb && useMongo) {
    await mongoDb.collection('warehouses').replaceOne({ id: warehouse.id }, warehouse, { upsert: true });
    return;
  }
  const idx = localDbState.warehouses.findIndex((w: any) => w.id === warehouse.id);
  if (idx > -1) localDbState.warehouses[idx] = warehouse;
  else localDbState.warehouses.push(warehouse);
  saveLocalDb();
}

export async function getMaintenanceLogs(): Promise<MaintenanceLog[]> {
  if (mongoDb && useMongo) return mongoDb.collection<MaintenanceLog>('maintenanceLogs').find().toArray();
  return localDbState.maintenanceLogs;
}

export async function saveMaintenanceLog(log: MaintenanceLog): Promise<void> {
  if (mongoDb && useMongo) {
    await mongoDb.collection('maintenanceLogs').replaceOne({ id: log.id }, log, { upsert: true });
    return;
  }
  const idx = localDbState.maintenanceLogs.findIndex((m: any) => m.id === log.id);
  if (idx > -1) localDbState.maintenanceLogs[idx] = log;
  else localDbState.maintenanceLogs.push(log);
  saveLocalDb();
}

export async function getFuelRecords(): Promise<FuelRecord[]> {
  if (mongoDb && useMongo) return mongoDb.collection<FuelRecord>('fuelRecords').find().toArray();
  return localDbState.fuelRecords;
}

export async function saveFuelRecord(record: FuelRecord): Promise<void> {
  if (mongoDb && useMongo) {
    await mongoDb.collection('fuelRecords').replaceOne({ id: record.id }, record, { upsert: true });
    return;
  }
  const idx = localDbState.fuelRecords.findIndex((f: any) => f.id === record.id);
  if (idx > -1) localDbState.fuelRecords[idx] = record;
  else localDbState.fuelRecords.push(record);
  saveLocalDb();
}

export async function getSimulationConfig(): Promise<SimulationConfig> {
  if (mongoDb && useMongo) {
    const config = await mongoDb.collection<SimulationConfig>('simulationConfig').findOne();
    return config || initialSeed.simulationConfig;
  }
  return localDbState.simulationConfig || initialSeed.simulationConfig;
}

export async function saveSimulationConfig(config: SimulationConfig): Promise<void> {
  if (mongoDb && useMongo) {
    await mongoDb.collection('simulationConfig').replaceOne({}, config, { upsert: true });
    return;
  }
  localDbState.simulationConfig = config;
  saveLocalDb();
}

export async function resetDatabase(): Promise<void> {
  if (mongoDb && useMongo) {
    await mongoDb.collection('vehicles').deleteMany({});
    await mongoDb.collection('drivers').deleteMany({});
    await mongoDb.collection('warehouses').deleteMany({});
    await mongoDb.collection('trips').deleteMany({});
    await mongoDb.collection('alerts').deleteMany({});
    await mongoDb.collection('maintenanceLogs').deleteMany({});
    await mongoDb.collection('fuelRecords').deleteMany({});
    await mongoDb.collection('simulationConfig').deleteMany({});

    await mongoDb.collection('vehicles').insertMany(initialSeed.vehicles);
    await mongoDb.collection('drivers').insertMany(initialSeed.drivers);
    await mongoDb.collection('warehouses').insertMany(initialSeed.warehouses);
    await mongoDb.collection('alerts').insertMany(initialSeed.alerts);
    await mongoDb.collection('maintenanceLogs').insertMany(initialSeed.maintenanceLogs);
    await mongoDb.collection('fuelRecords').insertMany(initialSeed.fuelRecords);
    await mongoDb.collection('simulationConfig').insertOne(initialSeed.simulationConfig);
  } else {
    localDbState = JSON.parse(JSON.stringify(initialSeed));
    saveLocalDb();
  }
  console.log('Database state reset to default seed configurations.');
}
