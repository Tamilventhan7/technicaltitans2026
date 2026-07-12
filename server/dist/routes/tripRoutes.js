"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const Driver_1 = __importDefault(require("../models/Driver"));
const Trip_1 = __importDefault(require("../models/Trip"));
const Reward_1 = __importDefault(require("../models/Reward"));
const routes_data_1 = require("../simulation/routes-data");
const engine_1 = require("../simulation/engine");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Log Audit Action Helper
async function logAudit(user, action, details) {
    try {
        await (0, db_1.saveAuditLog)({ user, action, details });
    }
    catch (err) {
        console.error('Audit log error:', err);
    }
}
// GET /trips
router.get('/', async (req, res) => {
    try {
        const list = await (0, db_1.getTrips)();
        res.json(list);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// POST /trips/dispatch (With strict business rules)
router.post('/dispatch', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['Admin', 'FleetManager', 'Dispatcher']), async (req, res) => {
    const { originId, destinationId, vehicleId, driverId, cargoType, cargoWeightKG } = req.body;
    const operator = req.user?.email || 'Dispatcher';
    try {
        const vehicle = await Vehicle_1.default.findOne({ vehicleNumber: vehicleId });
        const driver = await Driver_1.default.findOne({ driverId: driverId });
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
        const originHub = routes_data_1.HUBS[originId];
        const destHub = routes_data_1.HUBS[destinationId];
        if (!originHub || !destHub) {
            return res.status(400).json({ success: false, message: 'Invalid origin or destination hubs.' });
        }
        const waypoints = (0, routes_data_1.findRouteWaypoints)(originId, destinationId);
        const routeCoordinates = (0, routes_data_1.interpolateRoute)(waypoints, 300);
        const tripId = `TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
        const revenueRate = cargoType === 'hazmat' ? 3.50 : cargoType === 'cold-chain' ? 2.80 : 2.20;
        const distanceEst = routeCoordinates.length;
        const revenue = Math.round(distanceEst * revenueRate);
        // Save Trip record
        await Trip_1.default.create({
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
        await Vehicle_1.default.updateOne({ vehicleNumber: vehicleId }, { status: 'in-transit', assignedDriver: driverId, assignedTrip: tripId });
        await Driver_1.default.updateOne({ driverId: driverId }, { status: 'driving' });
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
        const io = req.io;
        if (io) {
            io.emit('trip-dispatched', mappedTrip);
        }
        res.status(201).json({
            success: true,
            message: 'Vehicle dispatched successfully on simulated GPS track.',
            data: mappedTrip
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// POST /trips/pod (Completes Trip + adds Rewards)
router.post('/pod', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(['Admin', 'Driver']), async (req, res) => {
    const { tripId, signature, photoUrl, receivedBy, odometer } = req.body;
    const operator = req.user?.email || 'Driver';
    try {
        const trip = await Trip_1.default.findOne({ tripId });
        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found.' });
        }
        await Trip_1.default.updateOne({ tripId }, {
            tripStatus: 'delivered',
            tripEnd: new Date(),
            proofOfDelivery: {
                signature,
                photoUrl,
                deliveredAt: new Date(),
                receivedBy: receivedBy || 'Client Cargo Lead'
            }
        });
        // Release vehicle
        await Vehicle_1.default.updateOne({ vehicleNumber: trip.vehicle }, { status: 'idle', odometer: odometer || 125000, assignedDriver: '', assignedTrip: '' });
        // Reward points triggers
        const driver = await Driver_1.default.findOne({ driverId: trip.driver });
        if (driver) {
            const addedPoints = 250;
            await Driver_1.default.updateOne({ driverId: trip.driver }, { status: 'available', rewardPoints: driver.rewardPoints + addedPoints });
            // Create Reward record
            await Reward_1.default.create({
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
        const io = req.io;
        if (io) {
            io.emit('trip-completed', mapped);
        }
        res.json({
            success: true,
            message: 'Proof of Delivery uploaded successfully. Driver reward points added.',
            data: mapped
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// POST /trips/incident
router.post('/incident', async (req, res) => {
    const { tripId, category } = req.body;
    const alert = await (0, engine_1.manualInjectIncident)(tripId, category);
    if (alert) {
        res.json(alert);
    }
    else {
        res.status(400).json({ success: false, message: 'Unable to inject incident. Ensure trip is active.' });
    }
});
exports.default = router;
