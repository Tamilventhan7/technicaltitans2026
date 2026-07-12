import { Router } from 'express';
import UserModel from '../models/User';
import { saveAuditLog } from '../db';

const router = Router();

// Log Audit Action Helper
async function logAudit(user: string, action: string, details: string) {
  try {
    await saveAuditLog({ user, action, details });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// POST /login
router.post('/login', async (req, res) => {
  const { username } = req.body;
  
  const roleMap: Record<string, 'Admin' | 'FleetManager' | 'Dispatcher' | 'Driver' | 'SafetyOfficer' | 'FinancialAnalyst'> = {
    admin: 'Admin',
    dispatcher: 'Dispatcher',
    driver: 'Driver',
    safety: 'SafetyOfficer',
    finance: 'FinancialAnalyst',
    manager: 'FleetManager'
  };

  const selectedRole = roleMap[username.toLowerCase()] || 'Admin';

  try {
    let user = await UserModel.findOne({ email: `${username}@transitops.com` });
    if (!user) {
      user = await UserModel.create({
        employeeId: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        name: username.charAt(0).toUpperCase() + username.slice(1) + ' Portal User',
        email: `${username}@transitops.com`,
        phone: '555-' + Math.floor(1000 + Math.random() * 9000),
        role: selectedRole,
        department: selectedRole === 'FinancialAnalyst' ? 'Finance' : 'Operations',
        status: 'active',
        notificationPreference: 'all',
        joiningDate: new Date()
      });
    }

    await logAudit(user.email, 'User Login', `Logged in with role: ${user.role}`);

    return res.json({
      success: true,
      token: 'mock-jwt-token-' + username,
      user: {
        id: user.employeeId,
        username: username,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /register
router.post('/register', async (req, res) => {
  const { name, email, phone, role, department } = req.body;
  try {
    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email address already exists.', errorCode: 'EMAIL_EXISTS' });
    }
    const user = await UserModel.create({
      employeeId: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
      name,
      email,
      phone,
      role,
      department,
      status: 'active'
    });
    await logAudit(email, 'User Registered', `Account created for ${name}`);
    res.status(201).json({ success: true, message: 'User registered successfully.', data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /logout
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /profile
router.get('/profile', async (req, res) => {
  const email = (req as any).user?.email || 'admin@transitops.com';
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Profile not found.' });
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
