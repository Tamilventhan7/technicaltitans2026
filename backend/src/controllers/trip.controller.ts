import { Response } from 'express';
import { validationResult } from 'express-validator';
import { Trip, Vehicle, Driver, Insurance, Alert } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { HUBS, findRouteWaypoints, interpolateRoute } from '../simulation/routes-data';
import { broadcastTripUpdate, broadcastAlert } from '../sockets/socket.handler';

export async function getTrips(req: AuthenticatedRequest, res: Response) {
  try {
    const query: any = { isDeleted: false };
    if (req.user?.organizationId) {
      query.organizationId = req.user.organizationId;
    }
    const list = await Trip.find(query);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function dispatchTrip(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { originId, destinationId, vehicleId, driverId, cargoType, cargoWeightKG } = req.body;
  const orgId = req.user?.organizationId || 'ORG-DEFAULT';

  try {
    const vehicle = await Vehicle.findOne({ id: vehicleId, isDeleted: false });
    const driver = await Driver.findOne({ id: driverId, isDeleted: false });

    if (!vehicle) return res.status(404).json({ error: `Vehicle ${vehicleId} not found` });
    if (!driver) return res.status(404).json({ error: `Driver ${driverId} not found` });

    // 1. Vehicles under maintenance cannot be dispatched.
    if (vehicle.status === 'maintenance') {
      return res.status(400).json({ error: `Vehicle ${vehicleId} is currently under maintenance and cannot be dispatched.` });
    }
    if (vehicle.status !== 'idle') {
      return res.status(400).json({ error: `Vehicle ${vehicleId} is not idle (status: ${vehicle.status}).` });
    }

    // 2. Driver must be available.
    if (driver.status !== 'available') {
      return res.status(400).json({ error: `Driver ${driverId} is not available (status: ${driver.status}).` });
    }

    // 3. Expired licenses block assignments.
    const today = new Date();
    if (today > new Date(driver.licenseExpiry)) {
      return res.status(400).json({ error: `Driver license for ${driver.name} is expired. Assignment blocked.` });
    }

    // 4. Vehicle cannot have two active trips.
    const activeVehicleTrip = await Trip.findOne({
      vehicleId,
      status: { $in: ['in-transit', 'delayed', 'dispatched'] },
      isDeleted: false
    });
    if (activeVehicleTrip) {
      return res.status(400).json({ error: `Vehicle ${vehicleId} has an active trip assignment.` });
    }

    // 5. Driver cannot have two active trips.
    const activeDriverTrip = await Trip.findOne({
      driverId,
      status: { $in: ['in-transit', 'delayed', 'dispatched'] },
      isDeleted: false
    });
    if (activeDriverTrip) {
      return res.status(400).json({ error: `Driver ${driverId} has an active trip assignment.` });
    }

    // 6. Insurance expiry blocks dispatch.
    const insurance = await Insurance.findOne({ vehicleId, isDeleted: false });
    if (!insurance || today > new Date(insurance.expiryDate)) {
      return res.status(400).json({ error: `Vehicle ${vehicleId} has expired or missing insurance coverage. Dispatch blocked.` });
    }

    // Coordinates and routing waypoint generation
    const originHub = HUBS[originId];
    const destHub = HUBS[destinationId];

    if (!originHub || !destHub) {
      return res.status(400).json({ error: 'Invalid origin or destination Hub ID' });
    }

    const waypoints = findRouteWaypoints(originId, destinationId);
    const routeCoordinates = interpolateRoute(waypoints, 300);

    const tripId = `TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
    const revenueRate = cargoType === 'hazmat' ? 3.50 : cargoType === 'cold-chain' ? 2.80 : 2.20;
    const distanceEst = routeCoordinates.length;
    const revenue = Math.round(distanceEst * revenueRate);

    const newTrip = await Trip.create({
      id: tripId,
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      vehicleId,
      driverId,
      origin: { name: originHub.name, lat: originHub.lat, lng: originHub.lng },
      destination: { name: destHub.name, lat: destHub.lat, lng: destHub.lng },
      status: 'in-transit',
      cargoType,
      cargoWeight: cargoWeightKG || 12000,
      departureTime: today,
      estimatedArrivalTime: new Date(Date.now() + 3600000 * 4), // 4h
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
      },
      organizationId: orgId,
      createdBy: req.user?.id,
      isDeleted: false
    });

    // Update vehicle and driver status
    vehicle.status = 'in-transit';
    vehicle.gps.latitude = originHub.lat;
    vehicle.gps.longitude = originHub.lng;
    vehicle.gps.speed = 0;
    await vehicle.save();

    driver.status = 'driving';
    await driver.save();

    // Notify clients through WebSocket
    broadcastTripUpdate('trip-dispatched', newTrip);

    res.status(201).json(newTrip);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function submitPod(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tripId, signature, photoUrl, receivedBy, odometer } = req.body;

  try {
    const trip = await Trip.findOne({ id: tripId, isDeleted: false });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const vehicle = await Vehicle.findOne({ id: trip.vehicleId, isDeleted: false });
    const driver = await Driver.findOne({ id: trip.driverId, isDeleted: false });

    // Complete POD status
    trip.status = 'delivered';
    trip.actualArrivalTime = new Date();
    trip.pod = {
      signature,
      photoUrl,
      deliveredAt: new Date(),
      receivedBy: receivedBy || 'Warehouse Dock Manager'
    };
    await trip.save();

    if (vehicle) {
      vehicle.status = 'idle';
      if (odometer) vehicle.odometer = odometer;
      await vehicle.save();
    }

    if (driver) {
      driver.status = 'available';
      driver.activeHoursToday = 0; // Reset active shift hours
      await driver.save();
    }

    broadcastTripUpdate('trip-completed', trip);

    res.json(trip);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function triggerIncident(req: AuthenticatedRequest, res: Response) {
  const { tripId, category } = req.body;

  try {
    const trip = await Trip.findOne({ id: tripId, isDeleted: false });
    if (!trip || trip.status === 'delivered' || trip.status === 'cancelled') {
      return res.status(400).json({ error: 'Trip is not active' });
    }

    const vehicle = await Vehicle.findOne({ id: trip.vehicleId, isDeleted: false });
    const driver = await Driver.findOne({ id: trip.driverId, isDeleted: false });

    if (!vehicle || !driver) {
      return res.status(400).json({ error: 'Assigned driver/vehicle records are missing' });
    }

    const currentCoords = trip.route[trip.currentRouteIndex] || { lat: vehicle.gps.latitude, lng: vehicle.gps.longitude };

    let message = '';
    let severity: 'critical' | 'warning' | 'info' = 'warning';

    trip.alertsTriggered.push(category);

    switch (category) {
      case 'speeding':
        vehicle.gps.speed = 115;
        driver.safetyScore = Math.max(0, driver.safetyScore - 8);
        message = `Speed Violation: Vehicle ${vehicle.id} driving at 115 KM/H in 90 KM/H zone. Driver ${driver.name} flagged.`;
        break;
      case 'harsh_braking':
        vehicle.gps.speed = Math.max(10, vehicle.gps.speed - 45);
        driver.safetyScore = Math.max(0, driver.safetyScore - 5);
        message = `Harsh Braking Event: Deceleration alert generated for vehicle ${vehicle.id}.`;
        break;
      case 'route_deviation':
        message = `Geofence Violation: Vehicle ${vehicle.id} has deviated from route.`;
        severity = 'info';
        break;
      case 'fuel_theft':
        vehicle.currentFuel = Math.max(10, vehicle.currentFuel - 65);
        message = `Security Alert: Severe fuel drop (65L) detected on ${vehicle.id}. Potential fuel theft.`;
        severity = 'critical';
        break;
      case 'maintenance':
        vehicle.healthScore = Math.max(30, vehicle.healthScore - 35);
        trip.status = 'delayed';
        message = `Mechanical Fault: Check engine light active on vehicle ${vehicle.id}.`;
        break;
      case 'accident':
        vehicle.healthScore = Math.max(10, vehicle.healthScore - 55);
        vehicle.gps.speed = 0;
        trip.status = 'delayed';
        driver.status = 'suspended';
        message = `Collision Warning: Vehicle ${vehicle.id} reported impact crash. Driver suspended.`;
        severity = 'critical';
        break;
      case 'weather_risk':
        message = `Hazard Warning: Severe storm tracking directly over Route ${trip.id}.`;
        break;
      case 'traffic_delay':
        trip.status = 'delayed';
        message = `Transit Congestion: Traffic delays predicted +45 mins.`;
        break;
    }

    const alert = await Alert.create({
      id: `AL-${category.slice(0, 3).toUpperCase()}-${Date.now()}`,
      tripId: trip.id,
      vehicleId: vehicle.id,
      driverId: driver.id,
      category,
      severity,
      message,
      timestamp: new Date(),
      resolved: false,
      location: currentCoords,
      isDeleted: false
    });

    await trip.save();
    await vehicle.save();
    await driver.save();

    broadcastAlert(alert);

    res.json(alert);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
