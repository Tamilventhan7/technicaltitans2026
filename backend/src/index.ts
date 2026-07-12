import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  connectDb, getVehicles, saveVehicle, getDrivers, saveDriver, 
  getTrips, saveTrip, getAlerts, saveAlert, getWarehouses, 
  getMaintenanceLogs, saveMaintenanceLog, getFuelRecords, saveFuelRecord, 
  getSimulationConfig, saveSimulationConfig, resetDatabase 
} from './db';
import { startSimulation, setIoInstance, setSimulationSpeed, manualInjectIncident } from './simulation/engine';
import { getDispatchRecommendations } from './ai/dispatch';
import { askAiCopilot } from './ai/gemini';
import { interpolateRoute, findRouteWaypoints, HUBS } from './simulation/routes-data';
import { Trip, Alert } from './types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Configure Socket.IO in simulation engine
setIoInstance(io);

// JWT Mock Auth Middleware
function mockAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  // Simplified auth validation
  next();
}

// REST Endpoints

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  // Simple enterprise mock login
  if (username === 'admin' || username === 'operator' || username === 'driver' || username === 'customer') {
    return res.json({
      token: 'mock-jwt-token-transitops',
      user: {
        id: `USR-${username.toUpperCase()}`,
        username,
        role: username === 'admin' ? 'admin' : username === 'driver' ? 'driver' : username === 'customer' ? 'customer' : 'operator',
        name: username.charAt(0).toUpperCase() + username.slice(1) + ' Account'
      }
    });
  }
  return res.status(400).json({ error: 'Invalid login credentials. Use admin, operator, driver, or customer.' });
});

app.get('/api/auth/me', mockAuth, (req, res) => {
  res.json({ id: 'USR-ADMIN', username: 'admin', role: 'admin', name: 'Global Administrator' });
});

// Fleet Management
app.get('/api/fleet/vehicles', async (req, res) => {
  const vehicles = await getVehicles();
  res.json(vehicles);
});

app.get('/api/fleet/drivers', async (req, res) => {
  const drivers = await getDrivers();
  res.json(drivers);
});

app.get('/api/fleet/warehouses', async (req, res) => {
  const warehouses = await getWarehouses();
  res.json(warehouses);
});

// Trips Endpoints
app.get('/api/trips', async (req, res) => {
  const trips = await getTrips();
  res.json(trips);
});

app.post('/api/trips/dispatch', async (req, res) => {
  const { originId, destinationId, vehicleId, driverId, cargoType, cargoWeightKG } = req.body;

  try {
    const vehicles = await getVehicles();
    const drivers = await getDrivers();
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const driver = drivers.find(d => d.id === driverId);

    if (!vehicle || vehicle.status !== 'idle') {
      return res.status(400).json({ error: `Vehicle ${vehicleId} is not available.` });
    }
    if (!driver || driver.status !== 'available') {
      return res.status(400).json({ error: `Driver ${driverId} is not available.` });
    }

    const originHub = HUBS[originId];
    const destHub = HUBS[destinationId];

    if (!originHub || !destHub) {
      return res.status(400).json({ error: 'Invalid origin or destination hub ID.' });
    }

    // Generate route coordinates
    const waypoints = findRouteWaypoints(originId, destinationId);
    const routeCoordinates = interpolateRoute(waypoints, 300);

    const tripId = `TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
    const revenueRate = cargoType === 'hazmat' ? 3.50 : cargoType === 'cold-chain' ? 2.80 : 2.20;
    const distanceEst = routeCoordinates.length; // roughly 1KM per coordinate
    const revenue = Math.round(distanceEst * revenueRate);

    const newTrip: Trip = {
      id: tripId,
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      vehicleId,
      driverId,
      origin: { name: originHub.name, lat: originHub.lat, lng: originHub.lng },
      destination: { name: destHub.name, lat: destHub.lat, lng: destHub.lng },
      status: 'in-transit',
      cargoType,
      cargoWeight: cargoWeightKG || 12000,
      departureTime: new Date().toISOString(),
      estimatedArrivalTime: new Date(Date.now() + 3600000 * 4).toISOString(), // 4h standard
      route: routeCoordinates,
      currentRouteIndex: 0,
      telemetryLogs: [],
      alertsTriggered: [],
      financials: {
        revenue,
        cost: 0,
        fuelCost: 0,
        driverCost: 0,
        tollCost: 0,
        profit: 0
      }
    };

    // Update statuses
    vehicle.status = 'in-transit';
    vehicle.gps.latitude = originHub.lat;
    vehicle.gps.longitude = originHub.lng;
    driver.status = 'driving';

    await saveTrip(newTrip);
    await saveVehicle(vehicle);
    await saveDriver(driver);

    // Broadcast update
    io.emit('trip-dispatched', newTrip);

    res.json(newTrip);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trips/pod', async (req, res) => {
  const { tripId, signature, photoUrl, receivedBy, odometer } = req.body;

  try {
    const trips = await getTrips();
    const trip = trips.find(t => t.id === tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const vehicles = await getVehicles();
    const drivers = await getDrivers();
    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const driver = drivers.find(d => d.id === trip.driverId);

    // Complete POD
    trip.status = 'delivered';
    trip.actualArrivalTime = new Date().toISOString();
    trip.pod = {
      signature,
      photoUrl,
      deliveredAt: new Date().toISOString(),
      receivedBy: receivedBy || 'Warehouse Dock Manager'
    };

    if (vehicle) {
      vehicle.status = 'idle';
      if (odometer) vehicle.odometer = odometer;
      await saveVehicle(vehicle);
    }
    if (driver) {
      driver.status = 'available';
      driver.activeHoursToday = 0; // reset
      await saveDriver(driver);
    }

    await saveTrip(trip);
    io.emit('trip-completed', trip);

    res.json(trip);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trips/incident', async (req, res) => {
  const { tripId, category } = req.body;
  const alert = await manualInjectIncident(tripId, category);
  if (alert) {
    res.json(alert);
  } else {
    res.status(400).json({ error: 'Unable to inject incident. Ensure trip is active.' });
  }
});

// AI & Optimization Endpoints
app.post('/api/ai/copilot', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query prompt required.' });
  const result = await askAiCopilot(query);
  res.json(result);
});

app.post('/api/ai/dispatch-recommendation', async (req, res) => {
  const { originId, destinationId, cargoWeightKG, cargoType } = req.body;
  const recommendations = await getDispatchRecommendations(originId, destinationId, cargoWeightKG, cargoType);
  res.json(recommendations);
});

// What-If stress test simulation endpoint
app.post('/api/ai/what-if', async (req, res) => {
  const { fuelPriceMultiplier, orderVolumeSpike, activeDriversUnavailableCount, weatherSeverity } = req.body;

  try {
    const config: any = await getSimulationConfig();
    
    // Perform calculations on how this would impact financials and logistics SLAs
    const trips = await getTrips();
    const activeTrips = trips.filter(t => t.status === 'in-transit' || t.status === 'delayed');

    // Model metrics
    const currentFuelPriceBase = 1.20;
    const simulatedFuelCost = currentFuelPriceBase * fuelPriceMultiplier;

    // Projected margins calculation
    let profitReduction = 0;
    let expectedDelayCount = 0;
    let projectedUnutilizedAssets = activeDriversUnavailableCount;

    activeTrips.forEach(t => {
      // Scale fuel cost
      const estimatedTripRemainingFuel = 150; // estimate
      profitReduction += estimatedTripRemainingFuel * (simulatedFuelCost - currentFuelPriceBase);

      // Scale delay index based on weather
      if (weatherSeverity === 'storm' || weatherSeverity === 'snow') {
        expectedDelayCount += 1;
      }
    });

    if (orderVolumeSpike > 0) {
      // Extra orders exceed available trucks capacity simulation
      const availableTrucks = (await getVehicles()).filter(v => v.status === 'idle').length;
      if (orderVolumeSpike > availableTrucks) {
        projectedUnutilizedAssets += (orderVolumeSpike - availableTrucks);
      }
    }

    const report = {
      fuelCostIncreasePercent: Math.round((fuelPriceMultiplier - 1) * 100),
      projectedProfitDeltaUSD: -Math.round(profitReduction),
      expectedDelayedTripsCount: expectedDelayCount,
      projectedSlaFulfillmentPercent: weatherSeverity === 'storm' ? 78 : weatherSeverity === 'snow' ? 84 : 98,
      recommendation: weatherSeverity === 'storm' 
        ? 'WARNING: Storm cell detected. Postpone Chicago hub departures. Re-route LAX shipments south via I-10.' 
        : 'Sufficient backup assets exist. Proceed with standard AI-optimized routing schedule.'
    };

    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// System Operations
app.post('/api/system/reset', async (req, res) => {
  await resetDatabase();
  res.json({ success: true, message: 'Database reset to standard seeds.' });
});

app.post('/api/system/simulation-speed', (req, res) => {
  const { multiplier } = req.body;
  if (typeof multiplier === 'number') {
    setSimulationSpeed(multiplier);
    res.json({ success: true, multiplier });
  } else {
    res.status(400).json({ error: 'Valid multiplier number required.' });
  }
});

// WebSockets Connection
io.on('connection', (socket) => {
  console.log(`Web browser client connected: ${socket.id}`);

  socket.on('set-speed', (speed: number) => {
    setSimulationSpeed(speed);
  });

  socket.on('inject-incident', async (data: { tripId: string, category: string }) => {
    await manualInjectIncident(data.tripId, data.category);
  });

  socket.on('disconnect', () => {
    console.log(`Web client disconnected: ${socket.id}`);
  });
});

// Boot Database and Server
connectDb().then(() => {
  server.listen(port, () => {
    console.log(`TransitOps Express Server listening on port ${port}`);
    // Start Simulation Engine Ticks
    startSimulation();
  });
});
