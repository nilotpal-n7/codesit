import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
  teamId?: string | null;
}

interface JwtPayload {
  userId: string;
  teamId: string | null;
}

/**
 * JWT authentication middleware.
 * Verifies the Bearer token and attaches user info to the request.
 */
export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = user;
    req.userId = decoded.userId;
    req.teamId = user.teamId?.toString() || null;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Generate a JWT token for a user.
 */
export const generateToken = (userId: string, teamId: string | null): string => {
  return jwt.sign(
    { userId, teamId },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '30d' }
  );
};
