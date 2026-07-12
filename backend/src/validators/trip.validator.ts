import { body } from 'express-validator';

export const createTripValidator = [
  body('originId').notEmpty().withMessage('Origin warehouse ID is required'),
  body('destinationId').notEmpty().withMessage('Destination warehouse ID is required'),
  body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
  body('driverId').notEmpty().withMessage('Driver ID is required'),
  body('cargoType').notEmpty().withMessage('Cargo type description is required'),
  body('cargoWeightKG').isNumeric().withMessage('Cargo weight must be a number').custom((val) => val > 0).withMessage('Cargo weight must be greater than 0')
];

export const podValidator = [
  body('tripId').notEmpty().withMessage('Trip ID is required'),
  body('signature').notEmpty().withMessage('Signature canvas drawing is required'),
  body('photoUrl').notEmpty().withMessage('POD proof photo is required'),
  body('receivedBy').notEmpty().withMessage('Receiver name is required'),
  body('odometer').optional().isNumeric().withMessage('Odometer reading must be a number')
];

export const incidentValidator = [
  body('tripId').notEmpty().withMessage('Trip ID is required'),
  body('category').isIn(['speeding', 'harsh_braking', 'route_deviation', 'fuel_theft', 'maintenance', 'accident', 'weather_risk', 'traffic_delay']).withMessage('Invalid incident category')
];
