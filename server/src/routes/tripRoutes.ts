import { Router } from 'express';
import { getTrips, getVehicles, getDrivers, saveAuditLog } from '../db';
import VehicleModel from '../models/Vehicle';
import DriverModel from '../models/Driver';
import TripModel from '../models/Trip';
import RewardModel from '../models/Reward';
import { interpolateRoute, findRouteWaypoints, HUBS } from '../simulation/routes-data';
import { manualInjectIncident } from '../simulation/engine';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Log Audit Action Helper
async function logAudit(user: string, action: string, details: string) {
  try {
    await saveAuditLog({ user, action, details });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// GET /trips
router.get('/', async (req, res) => {
  try {
    const list = await getTrips();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /trips/dispatch (With strict business rules)
router.post('/dispatch', authenticateToken, requireRole(['Admin', 'FleetManager', 'Dispatcher']), async (req, res) => {
  const { originId, destinationId, vehicleId, driverId, cargoType, cargoWeightKG } = req.body;
  const operator = (req as any).user?.email || 'Dispatcher';

  try {
    const vehicle = await VehicleModel.findOne({ vehicleNumber: vehicleId });
    const driver = await DriverModel.findOne({ driverId: driverId });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: `Vehicle ${vehicleId} not found.`, errorCode: 'VEHICLE_NOT_FOUND' });
    }
    if (!driver) {
      return res.status(404).json({ success: false, message: `Driver ${driverId} not found.`, errorCode: 'DRIVER_NOT_FOUND' });
    }

    // Business Rule 1: Vehicle under maintenance cannot be dispatched
    if (vehicle.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: `Asset Dispatch Blocked: Vehicle ${vehicleId} is currently under maintenance.`,
        errorCode: 'VEHICLE_UNDER_MAINTENANCE'
      });
    }

    // Business Rule 2: Expired license blocks driver assignment
    if (new Date(driver.licenseExpiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: `Driver Licensing Block: Driver ${driver.name} holds an expired license.`,
        errorCode: 'LICENSE_EXPIRED'
      });
    }

    // Business Rule 3: Insurance expired blocks dispatch
    if (new Date(vehicle.insuranceExpiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: `Compliance Lock: Vehicle ${vehicleId} has expired insurance records.`,
        errorCode: 'INSURANCE_EXPIRED'
      });
    }

    // Business Rule 4: Fitness expired blocks dispatch
    if (new Date(vehicle.fitnessExpiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: `Compliance Lock: Vehicle ${vehicleId} has expired fitness verification certification.`,
        errorCode: 'FITNESS_EXPIRED'
      });
    }

    // Business Rule 5: Driver cannot be on multiple active trips
    if (driver.status === 'driving') {
      return res.status(400).json({
        success: false,
        message: `Roster Conflict: Driver ${driver.name} is currently assigned to another active transit route.`,
        errorCode: 'DRIVER_BUSY'
      });
    }

    // Business Rule 6: Vehicle cannot be on two active trips
    if (vehicle.status === 'in-transit') {
      return res.status(400).json({
        success: false,
        message: `Asset Conflict: Vehicle ${vehicleId} is already rolling on an active dispatch line.`,
        errorCode: 'VEHICLE_BUSY'
      });
    }

    const originHub = HUBS[originId];
    const destHub = HUBS[destinationId];

    if (!originHub || !destHub) {
      return res.status(400).json({ success: false, message: 'Invalid origin or destination hubs.' });
    }

    const waypoints = findRouteWaypoints(originId, destinationId);
    const routeCoordinates = interpolateRoute(waypoints, 300);

    const tripId = `TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
    const revenueRate = cargoType === 'hazmat' ? 3.50 : cargoType === 'cold-chain' ? 2.80 : 2.20;
    const distanceEst = routeCoordinates.length;
    const revenue = Math.round(distanceEst * revenueRate);

    // Save Trip record
    await TripModel.create({
      tripId,
      vehicle: vehicleId,
      driver: driverId,
      pickupLocation: originHub.name,
      dropLocation: destHub.name,
      distance: distanceEst,
      estimatedTime: 4,
      tripStatus: 'in-transit',
      cargoType,
      customer: 'Samsara Logistics Partner',
      tripStart: new Date(),
      route: routeCoordinates,
      currentRouteIndex: 0,
      fuelUsed: 0,
      expenses: 0
    });

    // Update statuses
    await VehicleModel.updateOne({ vehicleNumber: vehicleId }, { status: 'in-transit', assignedDriver: driverId, assignedTrip: tripId });
    await DriverModel.updateOne({ driverId: driverId }, { status: 'driving' });

    await logAudit(operator, 'Trip Dispatched', `Dispatched Trip ${tripId}. Truck: ${vehicleId} | Driver: ${driverId}`);

    const mappedTrip = {
      id: tripId,
      orderId: 'ORD-' + tripId.split('-')[1],
      vehicleId,
      driverId,
      origin: { name: originHub.name, lat: originHub.lat, lng: originHub.lng },
      destination: { name: destHub.name, lat: destHub.lat, lng: destHub.lng },
      status: 'in-transit',
      cargoType,
      cargoWeight: cargoWeightKG || 12000,
      departureTime: new Date().toISOString(),
      estimatedArrivalTime: new Date(Date.now() + 3600000 * 4).toISOString(),
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
        profit: revenue
      }
    };

    // Emit to clients
    const io = (req as any).io;
    if (io) {
      io.emit('trip-dispatched', mappedTrip);
    }

    res.status(201).json({
      success: true,
      message: 'Vehicle dispatched successfully on simulated GPS track.',
      data: mappedTrip
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /trips/pod (Completes Trip + adds Rewards)
router.post('/pod', authenticateToken, requireRole(['Admin', 'Driver']), async (req, res) => {
  const { tripId, signature, photoUrl, receivedBy, odometer } = req.body;
  const operator = (req as any).user?.email || 'Driver';

  try {
    const trip = await TripModel.findOne({ tripId });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    await TripModel.updateOne(
      { tripId },
      {
        tripStatus: 'delivered',
        tripEnd: new Date(),
        proofOfDelivery: {
          signature,
          photoUrl,
          deliveredAt: new Date(),
          receivedBy: receivedBy || 'Client Cargo Lead'
        }
      }
    );

    // Release vehicle
    await VehicleModel.updateOne({ vehicleNumber: trip.vehicle }, { status: 'idle', odometer: odometer || 125000, assignedDriver: '', assignedTrip: '' });
    
    // Reward points triggers
    const driver = await DriverModel.findOne({ driverId: trip.driver });
    if (driver) {
      const addedPoints = 250;
      await DriverModel.updateOne(
        { driverId: trip.driver },
        { status: 'available', rewardPoints: driver.rewardPoints + addedPoints }
      );
      // Create Reward record
      await RewardModel.create({
        driver: trip.driver,
        points: addedPoints,
        badge: 'On-Time Star',
        reason: `Trip ${tripId} delivered successfully.`,
        trip: tripId
      });
    }

    await logAudit(operator, 'Trip Completed', `POD verified for trip ${tripId}. Reward points added.`);

    const mapped = {
      id: tripId,
      orderId: 'ORD-' + tripId.split('-')[1],
      vehicleId: trip.vehicle,
      driverId: trip.driver,
      origin: { name: trip.pickupLocation, lat: trip.route[0]?.lat, lng: trip.route[0]?.lng },
      destination: { name: trip.dropLocation, lat: trip.route[trip.route.length - 1]?.lat, lng: trip.route[trip.route.length - 1]?.lng },
      status: 'delivered',
      cargoType: trip.cargoType,
      cargoWeight: 12000,
      departureTime: trip.tripStart?.toISOString(),
      estimatedArrivalTime: new Date().toISOString(),
      route: trip.route,
      currentRouteIndex: trip.route.length - 1,
      telemetryLogs: [],
      alertsTriggered: [],
      financials: { revenue: trip.distance * 2.5, cost: trip.expenses, fuelCost: 0, driverCost: 0, tollCost: 0, profit: trip.distance * 2.5 - trip.expenses },
      pod: { signature, photoUrl, deliveredAt: new Date().toISOString(), receivedBy }
    };

    const io = (req as any).io;
    if (io) {
      io.emit('trip-completed', mapped);
    }

    res.json({
      success: true,
      message: 'Proof of Delivery uploaded successfully. Driver reward points added.',
      data: mapped
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /trips/incident
router.post('/incident', async (req, res) => {
  const { tripId, category } = req.body;
  const alert = await manualInjectIncident(tripId, category);
  if (alert) {
    res.json(alert);
  } else {
    res.status(400).json({ success: false, message: 'Unable to inject incident. Ensure trip is active.' });
  }
});

export default router;
