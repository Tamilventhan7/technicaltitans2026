import { Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendOtpEmail } from '../services/email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_access_token_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_token_key_2026';
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

export async function register(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role, organizationId } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await User.create({
      id: userId,
      username,
      email,
      passwordHash,
      role,
      organizationId,
      isDeleted: false
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        organizationId: newUser.organizationId
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function login(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, isDeleted: false });
    if (!user) {
      return res.status(400).json({ error: 'Invalid login credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid login credentials' });
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRATION as any }
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRATION as any }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function refreshToken(req: AuthenticatedRequest, res: Response) {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    const user = await User.findOne({ id: decoded.id, refreshToken: token, isDeleted: false });
    if (!user) {
      return res.status(403).json({ error: 'Invalid refresh token mapping' });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRATION as any }
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
}

export async function forgotPassword(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(404).json({ error: 'No user registered with this email address' });
    }

    // Generate 6 digit numeric code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({ message: 'Security verification OTP code dispatched to email' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function verifyOtpAndResetPassword(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email, otp, isDeleted: false });
    if (!user || !user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP code verification' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset completed successfully. You can log in now.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  try {
    const user = await User.findOne({ id: req.user.id, isDeleted: false }).select('-passwordHash -refreshToken -otp -otpExpiry');
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
