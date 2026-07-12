import { Router } from 'express';
import { getVehicles } from '../db';
import VehicleModel from '../models/Vehicle';
import AuditLogModel from '../models/AuditLog';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Log Audit Action Helper
async function logAudit(user: string, action: string, details: string) {
  try {
    await AuditLogModel.create({ action, details, user, timestamp: new Date() });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// GET /vehicles
router.get('/', async (req, res) => {
  try {
    const list = await getVehicles();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /vehicles
router.post('/', authenticateToken, requireRole(['Admin', 'FleetManager']), async (req, res) => {
  const { id, type, plateNumber, odometer } = req.body;
  const operator = (req as any).user?.email || 'Admin';
  try {
    const exists = await VehicleModel.findOne({ vehicleNumber: id });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Vehicle asset number already exists.', errorCode: 'VEHICLE_EXISTS' });
    }
    const doc = await VehicleModel.create({
      vehicleNumber: id,
      vehicleType: type,
      brand: 'Freightliner',
      model: 'Cascadia',
      year: 2023,
      fuelType: 'Diesel',
      capacity: type === 'Sprinter Van' ? 2000 : 25000,
      engineNumber: 'ENG-' + Date.now().toString().slice(-6),
      chassisNumber: 'CHS-' + Date.now().toString().slice(-6),
      insuranceNumber: plateNumber + '-INS',
      insuranceExpiry: new Date(Date.now() + 365 * 24 * 3600000),
      fitnessExpiry: new Date(Date.now() + 365 * 24 * 3600000),
      pollutionExpiry: new Date(Date.now() + 180 * 24 * 3600000),
      purchaseDate: new Date(),
      purchaseCost: 95000,
      odometer: odometer || 0,
      status: 'idle',
      healthScore: 100
    });
    await logAudit(operator, 'Vehicle Created', `Added vehicle asset: ${id}`);
    res.status(201).json({ success: true, message: 'Vehicle created successfully.', data: doc });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /vehicles/:id
router.delete('/:id', authenticateToken, requireRole(['Admin', 'FleetManager']), async (req, res) => {
  const { id } = req.params;
  const operator = (req as any).user?.email || 'Admin';
  try {
    await VehicleModel.updateOne({ vehicleNumber: id }, { isDeleted: true });
    await logAudit(operator, 'Vehicle Deleted', `Soft deleted vehicle: ${id}`);
    res.json({ success: true, message: `Vehicle ${id} deleted successfully.` });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
