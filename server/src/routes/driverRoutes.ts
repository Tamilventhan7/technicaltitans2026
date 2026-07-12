import { Router } from 'express';
import { getDrivers } from '../db';
import DriverModel from '../models/Driver';
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

// GET /drivers
router.get('/', async (req, res) => {
  try {
    const list = await getDrivers();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /drivers
router.post('/', authenticateToken, requireRole(['Admin', 'FleetManager', 'SafetyOfficer']), async (req, res) => {
  const { id, name, licenseNumber, phone, email } = req.body;
  const operator = (req as any).user?.email || 'Admin';
  try {
    const exists = await DriverModel.findOne({ driverId: id });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Driver ID already registered.', errorCode: 'DRIVER_EXISTS' });
    }
    const doc = await DriverModel.create({
      driverId: id,
      name,
      licenseNumber,
      licenseExpiry: new Date(Date.now() + 365 * 24 * 3600000), // 1 year
      bloodGroup: 'O+',
      phone,
      email,
      salary: 5000,
      experience: 5,
      status: 'available'
    });
    await logAudit(operator, 'Driver Registered', `Created driver profile: ${id}`);
    res.status(201).json({ success: true, message: 'Driver profile created successfully.', data: doc });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /drivers/:id
router.delete('/:id', authenticateToken, requireRole(['Admin', 'FleetManager', 'SafetyOfficer']), async (req, res) => {
  const { id } = req.params;
  const operator = (req as any).user?.email || 'Admin';
  try {
    await DriverModel.updateOne({ driverId: id }, { isDeleted: true });
    await logAudit(operator, 'Driver Deleted', `Soft deleted driver: ${id}`);
    res.json({ success: true, message: `Driver profile ${id} deleted.` });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
