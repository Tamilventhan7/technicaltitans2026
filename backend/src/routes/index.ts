import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';
import { authLimiter, standardLimiter } from '../middleware/rateLimiter';
import { uploadMiddleware } from '../services/upload.service';

import * as authController from '../controllers/auth.controller';
import * as fleetController from '../controllers/fleet.controller';
import * as tripController from '../controllers/trip.controller';
import * as operationsController from '../controllers/operations.controller';
import * as aiController from '../controllers/ai.controller';

import { registerValidator, loginValidator, forgotPasswordValidator, verifyOtpValidator } from '../validators/auth.validator';
import { createTripValidator, podValidator, incidentValidator } from '../validators/trip.validator';
import { createFuelLogValidator } from '../validators/fuel.validator';
import { createMaintenanceValidator } from '../validators/maintenance.validator';

const router = Router();

// ==========================================
// Authentication Routes
// ==========================================
router.post('/auth/register', authLimiter, registerValidator, authController.register);
router.post('/auth/login', authLimiter, loginValidator, authController.login);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/forgot-password', forgotPasswordValidator, authController.forgotPassword);
router.post('/auth/verify-otp', verifyOtpValidator, authController.verifyOtpAndResetPassword);
router.get('/auth/me', authenticateJWT, authController.getMe);

// ==========================================
// Fleet Management Routes
// ==========================================
// GET routes are open to support existing frontend dashboard loading, with optional JWT info
router.get('/fleet/vehicles', fleetController.getVehicles);
router.post('/fleet/vehicles', authenticateJWT, authorizeRoles('Admin', 'Fleet Manager'), fleetController.createVehicle);
router.put('/fleet/vehicles/:id', authenticateJWT, authorizeRoles('Admin', 'Fleet Manager'), fleetController.updateVehicle);
router.delete('/fleet/vehicles/:id', authenticateJWT, authorizeRoles('Admin'), fleetController.deleteVehicle);

router.get('/fleet/drivers', fleetController.getDrivers);
router.post('/fleet/drivers', authenticateJWT, authorizeRoles('Admin', 'Fleet Manager'), fleetController.createDriver);
router.put('/fleet/drivers/:id', authenticateJWT, authorizeRoles('Admin', 'Fleet Manager'), fleetController.updateDriver);
router.delete('/fleet/drivers/:id', authenticateJWT, authorizeRoles('Admin'), fleetController.deleteDriver);

router.get('/fleet/warehouses', fleetController.getWarehouses);

// Document upload route
router.post('/fleet/upload-document', authenticateJWT, uploadMiddleware.single('document'), fleetController.uploadDocument);

// ==========================================
// Trip Management Routes
// ==========================================
router.get('/trips', tripController.getTrips);
router.post('/trips/dispatch', createTripValidator, tripController.dispatchTrip);
router.post('/trips/pod', podValidator, tripController.submitPod);
router.post('/trips/incident', incidentValidator, tripController.triggerIncident);

// ==========================================
// Operations Management Routes
// ==========================================
router.get('/operations/fuel', getFuelLogsRoute);
router.post('/operations/fuel', createFuelLogValidator, operationsController.createFuelLog);

router.get('/operations/maintenance', getMaintenanceRecordsRoute);
router.post('/operations/maintenance', createMaintenanceValidator, operationsController.createMaintenanceRecord);

router.get('/operations/expenses', authenticateJWT, operationsController.getExpenses);
router.post('/operations/expenses', authenticateJWT, authorizeRoles('Admin', 'Fleet Manager', 'Financial Analyst'), operationsController.createExpense);
router.put('/operations/expenses/:id/approve', authenticateJWT, authorizeRoles('Admin', 'Financial Analyst'), operationsController.approveExpense);

router.get('/operations/report', operationsController.downloadReport);

// ==========================================
// AI & Innovative Features Routes
// ==========================================
router.post('/ai/copilot', aiController.askCopilot);
router.post('/ai/dispatch-recommendation', aiController.getDispatchRecommendationsEndpoint);
router.post('/ai/what-if', aiController.whatIfSimulation);

// Innovative APIs requested in spec
router.get('/ai/fleet-dna', aiController.getFleetDnaReport);
router.get('/vehicles/:id/dna', aiController.getVehicleDna);

router.get('/ai/compatibility', aiController.getCompatibilityReport);
router.get('/drivers/:id/compatibility', aiController.getDriverCompatibility);
router.get('/vehicles/:id/compatibility', aiController.getVehicleCompatibility);

router.get('/ai/memory', aiController.getFleetMemoryList);
router.get('/ai/recommendations', aiController.getLearningRecommendations);

router.post('/ai/simulate', aiController.runEmergencySimulation);
router.get('/ai/simulation-history', aiController.getSimulationHistoryList);

// ==========================================
// System Management Routes
// ==========================================
router.post('/system/reset', aiController.systemReset);
router.post('/system/simulation-speed', aiController.setSpeed);

// Route wrapper helpers to prevent errors when authenticateJWT is skipped for reading
function getFuelLogsRoute(req: any, res: any) {
  operationsController.getFuelLogs(req, res);
}
function getMaintenanceRecordsRoute(req: any, res: any) {
  operationsController.getMaintenanceRecords(req, res);
}

export default router;
