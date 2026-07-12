"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = connectDb;
exports.getVehicles = getVehicles;
exports.saveVehicle = saveVehicle;
exports.getDrivers = getDrivers;
exports.saveDriver = saveDriver;
exports.getTrips = getTrips;
exports.saveTrip = saveTrip;
exports.getAlerts = getAlerts;
exports.saveAlert = saveAlert;
exports.getWarehouses = getWarehouses;
exports.saveWarehouse = saveWarehouse;
exports.getMaintenanceLogs = getMaintenanceLogs;
exports.saveMaintenanceLog = saveMaintenanceLog;
exports.getFuelRecords = getFuelRecords;
exports.saveFuelRecord = saveFuelRecord;
exports.getSimulationConfig = getSimulationConfig;
exports.saveSimulationConfig = saveSimulationConfig;
exports.resetDatabase = resetDatabase;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
// Mongoose Models
const User_1 = __importDefault(require("./models/User"));
const Vehicle_1 = __importDefault(require("./models/Vehicle"));
const Driver_1 = __importDefault(require("./models/Driver"));
const Trip_1 = __importDefault(require("./models/Trip"));
const Maintenance_1 = __importDefault(require("./models/Maintenance"));
const FuelLog_1 = __importDefault(require("./models/FuelLog"));
const Expense_1 = __importDefault(require("./models/Expense"));
const Reward_1 = __importDefault(require("./models/Reward"));
const Notification_1 = __importDefault(require("./models/Notification"));
const AuditLog_1 = __importDefault(require("./models/AuditLog"));
const DATA_DIR = path_1.default.join(__dirname, '..', 'data');
const JSON_DB_PATH = path_1.default.join(DATA_DIR, 'db.json');
let localDbState = null;
let useMongoose = false;
// Seed data
const initialSeed = {
    vehicles: [
        { id: 'TRK-01', plateNumber: 'TX-892A', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 380, fuelEfficiency: 3.5, odometer: 120500, healthScore: 95, telemetry: { engineTemp: 82, oilPressure: 55, batteryVoltage: 14.1 }, gps: { latitude: 41.8781, longitude: -87.6298, speed: 0, heading: 0 } },
        { id: 'TRK-02', plateNumber: 'NY-442B', status: 'idle', type: 'Reefer', fuelCapacity: 350, currentFuel: 310, fuelEfficiency: 3.2, odometer: 88400, healthScore: 89, telemetry: { engineTemp: 84, oilPressure: 50, batteryVoltage: 13.8 }, gps: { latitude: 40.7128, longitude: -74.0060, speed: 0, heading: 0 } },
        { id: 'TRK-03', plateNumber: 'CA-102C', status: 'idle', type: 'Medium Cargo', fuelCapacity: 250, currentFuel: 240, fuelEfficiency: 4.8, odometer: 45000, healthScore: 92, telemetry: { engineTemp: 79, oilPressure: 52, batteryVoltage: 14.0 }, gps: { latitude: 34.0522, longitude: -118.2437, speed: 0, heading: 0 } },
        { id: 'TRK-04', plateNumber: 'TX-771D', status: 'idle', type: 'Sprinter Van', fuelCapacity: 100, currentFuel: 95, fuelEfficiency: 8.5, odometer: 32100, healthScore: 97, telemetry: { engineTemp: 78, oilPressure: 48, batteryVoltage: 14.2 }, gps: { latitude: 32.7767, longitude: -96.7970, speed: 0, heading: 0 } },
        { id: 'TRK-05', plateNumber: 'WA-554E', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 350, fuelEfficiency: 3.4, odometer: 145000, healthScore: 84, telemetry: { engineTemp: 86, oilPressure: 45, batteryVoltage: 13.5 }, gps: { latitude: 47.6062, longitude: -122.3321, speed: 0, heading: 0 } },
        { id: 'TRK-06', plateNumber: 'IL-910F', status: 'idle', type: 'Reefer', fuelCapacity: 350, currentFuel: 290, fuelEfficiency: 3.1, odometer: 95000, healthScore: 78, telemetry: { engineTemp: 88, oilPressure: 42, batteryVoltage: 13.4 }, gps: { latitude: 41.8781, longitude: -87.6298, speed: 0, heading: 0 } },
        { id: 'TRK-07', plateNumber: 'NY-332G', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 120, fuelEfficiency: 3.3, odometer: 210000, healthScore: 54, telemetry: { engineTemp: 98, oilPressure: 38, batteryVoltage: 12.8 }, gps: { latitude: 40.7128, longitude: -74.0060, speed: 0, heading: 0 } },
        { id: 'TRK-08', plateNumber: 'CA-993H', status: 'idle', type: 'Medium Cargo', fuelCapacity: 250, currentFuel: 80, fuelEfficiency: 4.5, odometer: 67000, healthScore: 88, telemetry: { engineTemp: 81, oilPressure: 51, batteryVoltage: 13.9 }, gps: { latitude: 34.0522, longitude: -118.2437, speed: 0, heading: 0 } },
        { id: 'TRK-09', plateNumber: 'TX-210I', status: 'idle', type: 'Heavy Duty Truck', fuelCapacity: 400, currentFuel: 390, fuelEfficiency: 3.6, odometer: 12000, healthScore: 99, telemetry: { engineTemp: 80, oilPressure: 58, batteryVoltage: 14.3 }, gps: { latitude: 32.7767, longitude: -96.7970, speed: 0, heading: 0 } },
        { id: 'TRK-10', plateNumber: 'WA-808J', status: 'idle', type: 'Sprinter Van', fuelCapacity: 100, currentFuel: 40, fuelEfficiency: 8.2, odometer: 84000, healthScore: 91, telemetry: { engineTemp: 80, oilPressure: 47, batteryVoltage: 13.7 }, gps: { latitude: 47.6062, longitude: -122.3321, speed: 0, heading: 0 } }
    ],
    drivers: [
        { id: 'DRV-01', name: 'James Carter', licenseNumber: 'DL-TX88910', licenseExpiry: '2028-11-20', status: 'available', rating: 4.9, safetyScore: 98, activeHoursToday: 0, totalMiles: 154000, gamification: { tier: 'Diamond', points: 14500, badges: ['Eco-Warrior', 'Safety Champion', 'Midnight Runner', 'Fuel Saver'], safeDrivingStreak: 45 } },
        { id: 'DRV-02', name: 'Sarah Jenkins', licenseNumber: 'DL-NY22104', licenseExpiry: '2027-04-12', status: 'available', rating: 4.8, safetyScore: 95, activeHoursToday: 0, totalMiles: 98000, gamification: { tier: 'Gold', points: 9200, badges: ['Customer Favorite', 'On-Time Master', 'Safety Champion'], safeDrivingStreak: 28 } },
        { id: 'DRV-03', name: 'Marcus Vance', licenseNumber: 'DL-CA99238', licenseExpiry: '2026-09-30', status: 'available', rating: 4.7, safetyScore: 92, activeHoursToday: 0, totalMiles: 112000, gamification: { tier: 'Gold', points: 8400, badges: ['Route Explorer', 'Eco-Warrior'], safeDrivingStreak: 15 } },
        { id: 'DRV-04', name: 'Carlos Gomez', licenseNumber: 'DL-TX55210', licenseExpiry: '2027-10-15', status: 'available', rating: 4.2, safetyScore: 72, activeHoursToday: 0, totalMiles: 48000, gamification: { tier: 'Bronze', points: 2100, badges: ['Speedy Starter'], safeDrivingStreak: 2 } },
        { id: 'DRV-05', name: 'Emily Taylor', licenseNumber: 'DL-WA33490', licenseExpiry: '2026-07-28', status: 'available', rating: 4.6, safetyScore: 89, activeHoursToday: 0, totalMiles: 65000, gamification: { tier: 'Silver', points: 5800, badges: ['On-Time Master'], safeDrivingStreak: 9 } },
        { id: 'DRV-06', name: 'Robert Chen', licenseNumber: 'DL-IL40412', licenseExpiry: '2029-01-05', status: 'available', rating: 4.9, safetyScore: 96, activeHoursToday: 0, totalMiles: 82000, gamification: { tier: 'Gold', points: 9900, badges: ['Eco-Warrior', 'Safety Champion', 'On-Time Master'], safeDrivingStreak: 34 } },
        { id: 'DRV-07', name: 'David Miller', licenseNumber: 'DL-NY77319', licenseExpiry: '2028-06-18', status: 'available', rating: 4.5, safetyScore: 85, activeHoursToday: 0, totalMiles: 135000, gamification: { tier: 'Silver', points: 6400, badges: ['Route Explorer', 'Midnight Runner'], safeDrivingStreak: 12 } },
        { id: 'DRV-08', name: 'Lisa Anderson', licenseNumber: 'DL-CA11029', licenseExpiry: '2027-08-22', status: 'available', rating: 4.7, safetyScore: 91, activeHoursToday: 0, totalMiles: 73000, gamification: { tier: 'Gold', points: 7900, badges: ['Customer Favorite', 'Eco-Warrior'], safeDrivingStreak: 18 } }
    ],
    warehouses: [
        { id: 'WH-CHI', name: 'Chicago Logistic Hub', location: { lat: 41.8781, lng: -87.6298 }, capacity: 1500, inventoryLevel: 1120, incomingShipments: 8, outgoingShipments: 12 },
        { id: 'WH-NYC', name: 'New York Port Depot', location: { lat: 40.7128, lng: -74.0060 }, capacity: 2000, inventoryLevel: 1450, incomingShipments: 15, outgoingShipments: 18 },
        { id: 'WH-LAX', name: 'Los Angeles Freight Terminal', location: { lat: 34.0522, lng: -118.2437 }, capacity: 1800, inventoryLevel: 980, incomingShipments: 6, outgoingShipments: 7 },
        { id: 'WH-DFW', name: 'Dallas Dispatch Yard', location: { lat: 32.7767, lng: -96.7970 }, capacity: 1200, inventoryLevel: 800, incomingShipments: 10, outgoingShipments: 11 },
        { id: 'WH-SEA', name: 'Seattle Port Gateway', location: { lat: 47.6062, lng: -122.3321 }, capacity: 1000, inventoryLevel: 620, incomingShipments: 4, outgoingShipments: 5 }
    ],
    trips: [],
    alerts: [
        { id: 'AL-101', vehicleId: 'TRK-07', category: 'maintenance', severity: 'warning', message: 'Engine Temperature High (98°C). Maintenance recommended.', timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: false },
        { id: 'AL-102', driverId: 'DRV-05', category: 'maintenance', severity: 'info', message: 'Driver License DL-WA33490 expires in 16 days.', timestamp: new Date(Date.now() - 7200000).toISOString(), resolved: false }
    ],
    maintenanceLogs: [
        { id: 'MT-01', vehicleId: 'TRK-01', date: '2026-06-15', type: 'Routine Oil Change', cost: 150, status: 'completed', notes: 'Full synthetic oil and filter change. All fluids topped off.' },
        { id: 'MT-02', vehicleId: 'TRK-05', date: '2026-07-02', type: 'Brake Replacement', cost: 650, status: 'completed', notes: 'Replaced front and rear brake pads, turned rotors.' },
        { id: 'MT-03', vehicleId: 'TRK-07', date: '2026-07-18', type: 'Engine Overhaul', cost: 2400, status: 'scheduled', notes: 'Investigate overheating issues and low oil pressure warnings.' }
    ],
    fuelRecords: [
        { id: 'FL-01', vehicleId: 'TRK-01', date: '2026-07-10', liters: 120, cost: 180, station: 'Pilot Flying J #442', theftDetected: false },
        { id: 'FL-02', vehicleId: 'TRK-03', date: '2026-07-11', liters: 80, cost: 128, station: 'Love\'s Travel Stop #108', theftDetected: false }
    ],
    simulationConfig: {
        fuelPriceMultiplier: 1.0,
        orderVolumeSpike: 0,
        activeDriversUnavailableCount: 0,
        weatherSeverity: 'clear',
        trafficLevel: 'normal'
    }
};
// Initialize file db fallback
if (!fs_1.default.existsSync(DATA_DIR)) {
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs_1.default.existsSync(JSON_DB_PATH)) {
    fs_1.default.writeFileSync(JSON_DB_PATH, JSON.stringify(initialSeed, null, 2));
}
localDbState = JSON.parse(fs_1.default.readFileSync(JSON_DB_PATH, 'utf-8'));
function saveLocalDb() {
    if (!useMongoose) {
        fs_1.default.writeFileSync(JSON_DB_PATH, JSON.stringify(localDbState, null, 2));
    }
}
async function connectDb() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/transitops';
    try {
        console.log(`Attempting Mongoose connection to: ${uri}`);
        // Set low timeout (2.5 seconds) so offline fallback is fast
        await mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 2500 });
        useMongoose = true;
        console.log('MongoDB Mongoose ORM Connected.');
        // Seed Mongoose collections if empty
        await seedMongooseCollections();
    }
    catch (err) {
        console.error('Mongoose offline fallback active. Database using server/data/db.json storage.', err);
        useMongoose = false;
    }
}
async function seedMongooseCollections() {
    try {
        if (await Vehicle_1.default.countDocuments() === 0) {
            console.log('Seeding Mongoose collections...');
            // Map and insert vehicles
            const vData = initialSeed.vehicles.map(v => ({
                vehicleNumber: v.id,
                vehicleType: v.type,
                brand: 'Freightliner',
                model: 'Cascadia',
                year: 2022,
                fuelType: 'Diesel',
                capacity: v.type === 'Sprinter Van' ? 2000 : v.type === 'Medium Cargo' ? 10000 : 25000,
                engineNumber: 'ENG-' + Math.floor(100000 + Math.random() * 900000),
                chassisNumber: 'CHS-' + Math.floor(100000 + Math.random() * 900000),
                insuranceNumber: v.plateNumber + '-INS',
                insuranceExpiry: new Date(Date.now() + 365 * 24 * 3600000), // 1 year
                fitnessExpiry: new Date(Date.now() + 365 * 24 * 3600000),
                pollutionExpiry: new Date(Date.now() + 180 * 24 * 3600000),
                purchaseDate: new Date('2022-01-15'),
                purchaseCost: 120000,
                odometer: v.odometer,
                status: v.status,
                healthScore: v.healthScore,
                documents: [],
                images: []
            }));
            await Vehicle_1.default.insertMany(vData);
            // Seed Drivers
            const dData = initialSeed.drivers.map(d => ({
                driverId: d.id,
                name: d.name,
                licenseNumber: d.licenseNumber,
                licenseExpiry: new Date(d.licenseExpiry),
                bloodGroup: d.bloodGroup || 'O+',
                phone: d.phone || '555-0111',
                email: d.email || `${d.name.toLowerCase().replace(/\s+/g, '')}@transitops.com`,
                joiningDate: d.joiningDate ? new Date(d.joiningDate) : new Date(),
                salary: d.salary || 4500,
                experience: d.experience || 5,
                safetyScore: d.safetyScore,
                rewardPoints: d.gamification.points,
                rank: d.gamification.tier === 'Diamond' ? 'Diamond' : d.gamification.tier === 'Gold' ? 'Gold' : d.gamification.tier === 'Silver' ? 'Silver' : 'Bronze',
                documents: d.gamification.badges,
                status: d.status
            }));
            await Driver_1.default.insertMany(dData);
            // Seed initial mock user accounts
            await User_1.default.create([
                { employeeId: 'EMP-01', name: 'System Administrator', email: 'admin@transitops.com', phone: '555-0101', role: 'Admin', department: 'Executive', status: 'active', notificationPreference: 'all', joiningDate: new Date() },
                { employeeId: 'EMP-02', name: 'Dispatcher Yard Manager', email: 'dispatcher@transitops.com', phone: '555-0102', role: 'Dispatcher', department: 'Operations', status: 'active', notificationPreference: 'all', joiningDate: new Date() },
                { employeeId: 'EMP-03', name: 'Safety Officer', email: 'safety@transitops.com', phone: '555-0103', role: 'SafetyOfficer', department: 'Compliance', status: 'active', notificationPreference: 'critical', joiningDate: new Date() },
                { employeeId: 'EMP-04', name: 'Financial Lead', email: 'analyst@transitops.com', phone: '555-0104', role: 'FinancialAnalyst', department: 'Finance', status: 'active', notificationPreference: 'none', joiningDate: new Date() }
            ]);
        }
    }
    catch (err) {
        console.error('Error seeding Mongoose collections:', err);
    }
}
// Data Mappings: Mongoose -> Frontend Typings
function mapMongooseVehicle(doc) {
    return {
        id: doc.vehicleNumber,
        plateNumber: doc.insuranceNumber.split('-')[0], // mock plate
        status: doc.status,
        type: doc.vehicleType,
        fuelCapacity: doc.vehicleType === 'Sprinter Van' ? 100 : doc.vehicleType === 'Medium Cargo' ? 250 : 400,
        currentFuel: doc.vehicleType === 'Sprinter Van' ? 80 : 300, // standard mock fallback
        fuelEfficiency: doc.vehicleType === 'Sprinter Van' ? 8.5 : 3.5,
        odometer: doc.odometer,
        healthScore: doc.healthScore,
        telemetry: { engineTemp: 82, oilPressure: 52, batteryVoltage: 13.9 },
        gps: { latitude: 39.8283, longitude: -98.5795, speed: 0, heading: 0 } // Standard center
    };
}
function mapMongooseDriver(doc) {
    return {
        id: doc.driverId,
        name: doc.name,
        licenseNumber: doc.licenseNumber,
        licenseExpiry: new Date(doc.licenseExpiry).toISOString().split('T')[0],
        status: doc.status,
        rating: 4.7,
        safetyScore: doc.safetyScore,
        activeHoursToday: 0,
        totalMiles: doc.experience * 15000, // mock
        gamification: {
            tier: doc.rank,
            points: doc.rewardPoints,
            badges: doc.documents, // using documents array as badges store on driver seeding
            safeDrivingStreak: 12
        }
    };
}
function mapMongooseTrip(doc) {
    return {
        id: doc.tripId,
        orderId: 'ORD-' + doc.tripId.split('-')[1],
        vehicleId: doc.vehicle,
        driverId: doc.driver,
        origin: { name: doc.pickupLocation, lat: doc.route[0]?.lat || 39.82, lng: doc.route[0]?.lng || -98.5 },
        destination: { name: doc.dropLocation, lat: doc.route[doc.route.length - 1]?.lat || 39.82, lng: doc.route[doc.route.length - 1]?.lng || -98.5 },
        status: doc.tripStatus,
        cargoType: doc.cargoType,
        cargoWeight: doc.distance * 10, // mock payload weight
        departureTime: doc.tripStart ? doc.tripStart.toISOString() : new Date().toISOString(),
        estimatedArrivalTime: new Date(Date.now() + 3600000 * doc.estimatedTime).toISOString(),
        actualArrivalTime: doc.tripEnd ? doc.tripEnd.toISOString() : undefined,
        route: doc.route,
        currentRouteIndex: doc.currentRouteIndex,
        telemetryLogs: [],
        alertsTriggered: [],
        financials: {
            revenue: doc.distance * 2.5,
            cost: doc.expenses,
            fuelCost: doc.fuelUsed * 1.20,
            driverCost: doc.distance * 0.45,
            tollCost: doc.distance * 0.05,
            profit: doc.distance * 2.5 - doc.expenses
        },
        pod: doc.proofOfDelivery ? {
            signature: doc.proofOfDelivery.signature,
            photoUrl: doc.proofOfDelivery.photoUrl,
            deliveredAt: doc.proofOfDelivery.deliveredAt ? doc.proofOfDelivery.deliveredAt.toISOString() : '',
            receivedBy: doc.proofOfDelivery.receivedBy
        } : undefined
    };
}
// Database Getters & Setters
async function getVehicles() {
    if (useMongoose) {
        const docs = await Vehicle_1.default.find().lean();
        return docs.map(mapMongooseVehicle);
    }
    return localDbState.vehicles;
}
async function saveVehicle(vehicle) {
    if (useMongoose) {
        await Vehicle_1.default.updateOne({ vehicleNumber: vehicle.id }, {
            status: vehicle.status,
            odometer: vehicle.odometer,
            healthScore: vehicle.healthScore,
            assignedDriver: vehicle.assignedDriver || '',
            assignedTrip: vehicle.assignedTrip || ''
        }, { upsert: true });
        return;
    }
    const idx = localDbState.vehicles.findIndex((v) => v.id === vehicle.id);
    if (idx > -1)
        localDbState.vehicles[idx] = vehicle;
    else
        localDbState.vehicles.push(vehicle);
    saveLocalDb();
}
async function getDrivers() {
    if (useMongoose) {
        const docs = await Driver_1.default.find().lean();
        return docs.map(mapMongooseDriver);
    }
    return localDbState.drivers;
}
async function saveDriver(driver) {
    if (useMongoose) {
        await Driver_1.default.updateOne({ driverId: driver.id }, {
            status: driver.status,
            safetyScore: driver.safetyScore,
            rewardPoints: driver.gamification.points,
            rank: driver.gamification.tier
        }, { upsert: true });
        return;
    }
    const idx = localDbState.drivers.findIndex((d) => d.id === driver.id);
    if (idx > -1)
        localDbState.drivers[idx] = driver;
    else
        localDbState.drivers.push(driver);
    saveLocalDb();
}
async function getTrips() {
    if (useMongoose) {
        const docs = await Trip_1.default.find().lean();
        return docs.map(mapMongooseTrip);
    }
    return localDbState.trips;
}
async function saveTrip(trip) {
    if (useMongoose) {
        await Trip_1.default.updateOne({ tripId: trip.id }, {
            tripStatus: trip.status,
            currentRouteIndex: trip.currentRouteIndex,
            fuelUsed: trip.fuelUsed,
            expenses: trip.financials.cost,
            tripStart: trip.departureTime ? new Date(trip.departureTime) : undefined,
            tripEnd: trip.actualArrivalTime ? new Date(trip.actualArrivalTime) : undefined,
            proofOfDelivery: trip.pod ? {
                signature: trip.pod.signature,
                photoUrl: trip.pod.photoUrl,
                deliveredAt: trip.pod.deliveredAt ? new Date(trip.pod.deliveredAt) : new Date(),
                receivedBy: trip.pod.receivedBy
            } : undefined
        }, { upsert: true });
        return;
    }
    const idx = localDbState.trips.findIndex((t) => t.id === trip.id);
    if (idx > -1)
        localDbState.trips[idx] = trip;
    else
        localDbState.trips.push(trip);
    saveLocalDb();
}
async function getAlerts() {
    if (useMongoose) {
        const docs = await Notification_1.default.find({ type: { $ne: 'info' } }).lean();
        return docs.map((doc) => ({
            id: doc._id.toString(),
            tripId: doc.title.includes('Trip') ? doc.title.split(' ')[1] : undefined,
            vehicleId: doc.title.includes('TRK') ? doc.title.split(' ')[1] : undefined,
            category: doc.type,
            severity: doc.priority === 'critical' ? 'critical' : doc.priority === 'high' ? 'warning' : 'info',
            message: doc.message,
            timestamp: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
            resolved: doc.read
        }));
    }
    return localDbState.alerts;
}
async function saveAlert(alert) {
    if (useMongoose) {
        await Notification_1.default.create({
            title: `System Alert ${alert.vehicleId || alert.tripId || ''}`,
            message: alert.message,
            priority: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'high' : 'medium',
            type: alert.category,
            read: alert.resolved
        });
        return;
    }
    const idx = localDbState.alerts.findIndex((a) => a.id === alert.id);
    if (idx > -1)
        localDbState.alerts[idx] = alert;
    else
        localDbState.alerts.push(alert);
    saveLocalDb();
}
async function getWarehouses() {
    return localDbState.warehouses;
}
async function saveWarehouse(warehouse) {
    const idx = localDbState.warehouses.findIndex((w) => w.id === warehouse.id);
    if (idx > -1)
        localDbState.warehouses[idx] = warehouse;
    else
        localDbState.warehouses.push(warehouse);
    saveLocalDb();
}
async function getMaintenanceLogs() {
    if (useMongoose) {
        const docs = await Maintenance_1.default.find().lean();
        return docs.map((doc) => ({
            id: doc.maintenanceId,
            vehicleId: doc.vehicle,
            date: doc.nextServiceDate.toISOString().split('T')[0],
            type: doc.maintenanceType,
            cost: doc.cost,
            status: doc.status,
            notes: doc.description
        }));
    }
    return localDbState.maintenanceLogs;
}
async function saveMaintenanceLog(log) {
    if (useMongoose) {
        await Maintenance_1.default.updateOne({ maintenanceId: log.id }, {
            vehicle: log.vehicleId,
            maintenanceType: log.type,
            cost: log.cost,
            description: log.notes,
            status: log.status,
            nextServiceDate: new Date(log.date),
            currentMileage: 100000, // mock
            nextMileage: 110000,
            technician: 'Senior Mechanic'
        }, { upsert: true });
        return;
    }
    const idx = localDbState.maintenanceLogs.findIndex((m) => m.id === log.id);
    if (idx > -1)
        localDbState.maintenanceLogs[idx] = log;
    else
        localDbState.maintenanceLogs.push(log);
    saveLocalDb();
}
async function getFuelRecords() {
    if (useMongoose) {
        const docs = await FuelLog_1.default.find().lean();
        return docs.map((doc) => ({
            id: doc._id.toString(),
            vehicleId: doc.vehicle,
            date: doc.date.toISOString().split('T')[0],
            liters: doc.litres,
            cost: doc.amount,
            station: doc.fuelStation,
            theftDetected: false
        }));
    }
    return localDbState.fuelRecords;
}
async function saveFuelRecord(record) {
    if (useMongoose) {
        await FuelLog_1.default.create({
            vehicle: record.vehicleId,
            driver: 'DRV-01', // mock defaults
            fuelType: 'Diesel',
            litres: record.liters,
            amount: record.cost,
            fuelStation: record.station,
            odometer: 120500,
            date: new Date(record.date)
        });
        return;
    }
    const idx = localDbState.fuelRecords.findIndex((f) => f.id === record.id);
    if (idx > -1)
        localDbState.fuelRecords[idx] = record;
    else
        localDbState.fuelRecords.push(record);
    saveLocalDb();
}
async function getSimulationConfig() {
    return localDbState.simulationConfig || { fuelPriceMultiplier: 1.0, orderVolumeSpike: 0, activeDriversUnavailableCount: 0, weatherSeverity: 'clear', trafficLevel: 'normal' };
}
async function saveSimulationConfig(config) {
    localDbState.simulationConfig = config;
    saveLocalDb();
}
async function resetDatabase() {
    if (useMongoose) {
        await Vehicle_1.default.deleteMany({});
        await Driver_1.default.deleteMany({});
        await Trip_1.default.deleteMany({});
        await Maintenance_1.default.deleteMany({});
        await FuelLog_1.default.deleteMany({});
        await Expense_1.default.deleteMany({});
        await Reward_1.default.deleteMany({});
        await Notification_1.default.deleteMany({});
        await AuditLog_1.default.deleteMany({});
        await User_1.default.deleteMany({});
        await seedMongooseCollections();
    }
    else {
        localDbState = JSON.parse(JSON.stringify(initialSeed));
        saveLocalDb();
    }
    console.log('Database state initialized successfully.');
}
