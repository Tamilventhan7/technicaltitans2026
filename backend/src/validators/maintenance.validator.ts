import { body } from 'express-validator';

export const createMaintenanceValidator = [
  body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
  body('date').isISO8601().withMessage('Service date must be a valid date format'),
  body('type').isIn(['Routine Oil Change', 'Brake Replacement', 'Engine Overhaul', 'Tire Rotation', 'Sensor Calibration']).withMessage('Invalid service type selection'),
  body('cost').isFloat({ min: 0 }).withMessage('Service cost cannot be negative'),
  body('status').isIn(['scheduled', 'in-progress', 'completed']).withMessage('Invalid maintenance status'),
  body('notes').optional().trim()
];
