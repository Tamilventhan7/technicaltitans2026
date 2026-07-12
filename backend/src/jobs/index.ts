import cron from 'node-cron';
import { Driver, Vehicle, Insurance, Alert } from '../models';
import * as aiService from '../services/ai.service';
import { broadcastAlert } from '../sockets/socket.handler';

export function initCronJobs() {
  console.log('TransitOps Background Scheduler Initialized.');

  // 1. License Expiry Check: Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron Job] Checking for driver license expirations...');
    try {
      const today = new Date();
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const drivers = await Driver.find({ isDeleted: false });
      for (const driver of drivers) {
        if (new Date(driver.licenseExpiry) < today) {
          const alertId = `AL-LIC-EXP-${driver.id}`;
          const existing = await Alert.findOne({ id: alertId, resolved: false });
          if (!existing) {
            const alert = await Alert.create({
              id: alertId,
              driverId: driver.id,
              category: 'maintenance',
              severity: 'critical',
              message: `Licensing Breach: Driver ${driver.name}'s license (${driver.licenseNumber}) is expired. Assignments suspended.`,
              timestamp: new Date(),
              resolved: false,
              isDeleted: false
            });
            broadcastAlert(alert);
          }
        } else if (new Date(driver.licenseExpiry) < nextMonth) {
          const alertId = `AL-LIC-WARN-${driver.id}`;
          const existing = await Alert.findOne({ id: alertId, resolved: false });
          if (!existing) {
            const alert = await Alert.create({
              id: alertId,
              driverId: driver.id,
              category: 'maintenance',
              severity: 'warning',
              message: `Compliance Notice: Driver ${driver.name}'s license expires in less than 30 days. Renewal required.`,
              timestamp: new Date(),
              resolved: false,
              isDeleted: false
            });
            broadcastAlert(alert);
          }
        }
      }
    } catch (error) {
      console.error('Error running License Expiry Cron:', error);
    }
  });

  // 2. Insurance Policy Renewal Check: Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron Job] Checking for vehicle insurance policy expirations...');
    try {
      const today = new Date();
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const vehicles = await Vehicle.find({ isDeleted: false });
      for (const vehicle of vehicles) {
        const insurance = await Insurance.findOne({ vehicleId: vehicle.id, isDeleted: false });
        if (!insurance) continue;

        if (new Date(insurance.expiryDate) < today) {
          const alertId = `AL-INS-EXP-${vehicle.id}`;
          const existing = await Alert.findOne({ id: alertId, resolved: false });
          if (!existing) {
            const alert = await Alert.create({
              id: alertId,
              vehicleId: vehicle.id,
              category: 'maintenance',
              severity: 'critical',
              message: `Insurance Deficit: Vehicle ${vehicle.id}'s insurance is expired. Fleet dispatch suspended.`,
              timestamp: new Date(),
              resolved: false,
              isDeleted: false
            });
            broadcastAlert(alert);
          }
        } else if (new Date(insurance.expiryDate) < nextMonth) {
          const alertId = `AL-INS-WARN-${vehicle.id}`;
          const existing = await Alert.findOne({ id: alertId, resolved: false });
          if (!existing) {
            const alert = await Alert.create({
              id: alertId,
              vehicleId: vehicle.id,
              category: 'maintenance',
              severity: 'warning',
              message: `Insurance Renewal Warning: Policy for ${vehicle.id} expires soon.`,
              timestamp: new Date(),
              resolved: false,
              isDeleted: false
            });
            broadcastAlert(alert);
          }
        }
      }
    } catch (error) {
      console.error('Error running Insurance Expiry Cron:', error);
    }
  });

  // 3. AI Engines Recalculator: Run every hour to refresh vehicle DNA and compatibility pairings
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron Job] Recalculating AI Fleet DNA and Compatibility Indexes...');
    try {
      const vehicles = await Vehicle.find({ isDeleted: false });
      const drivers = await Driver.find({ isDeleted: false });

      for (const vehicle of vehicles) {
        await aiService.calculateVehicleDna(vehicle.id);
      }

      for (let i = 0; i < Math.min(drivers.length, vehicles.length); i++) {
        await aiService.calculateCompatibility(drivers[i].id, vehicles[i].id);
      }
      console.log('[Cron Job] AI metrics recalculation completed successfully.');
    } catch (error) {
      console.error('Error running AI recalculation Cron:', error);
    }
  });
}
