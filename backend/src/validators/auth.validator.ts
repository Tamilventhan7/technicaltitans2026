import { body } from 'express-validator';

export const registerValidator = [
  body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['Admin', 'Fleet Manager', 'Dispatcher', 'Driver', 'Safety Officer', 'Financial Analyst']).withMessage('Invalid system role'),
  body('organizationId').notEmpty().withMessage('Organization ID is required')
];

export const loginValidator = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Provide a valid email address').normalizeEmail()
];

export const verifyOtpValidator = [
  body('email').isEmail().withMessage('Provide a valid email address').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];
