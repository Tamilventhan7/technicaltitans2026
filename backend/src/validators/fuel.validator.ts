import { body } from 'express-validator';

export const createFuelLogValidator = [
  body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
  body('driverId').notEmpty().withMessage('Driver ID is required'),
  body('date').isISO8601().withMessage('Date must be a valid date format'),
  body('liters').isFloat({ min: 0.1 }).withMessage('Liters logged must be greater than 0'),
  body('cost').isFloat({ min: 0.1 }).withMessage('Fuel cost must be greater than 0'),
  body('station').trim().notEmpty().withMessage('Station name is required'),
  body('odometer').isNumeric().withMessage('Odometer reading must be a number')
];
