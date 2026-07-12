import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: UserRole;
    organizationId: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_access_token_key_2026';

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Format is Authorization: Bearer <token>' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      organizationId: decoded.organizationId
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authorization token' });
  }
}
