import { Router } from 'express';
import authRoutes from './authRoutes';
import vehicleRoutes from './vehicleRoutes';
import driverRoutes from './driverRoutes';
import tripRoutes from './tripRoutes';
import expenseRoutes from './expenseRoutes';
import systemRoutes from './systemRoutes';
import { getWarehouses } from '../db';

const router = Router();

// Mount Sub-routers
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/expenses', expenseRoutes);
router.use('/system', systemRoutes);

// Shared route for warehouses
router.get('/warehouses', async (req, res) => {
  try {
    const list = await getWarehouses();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
