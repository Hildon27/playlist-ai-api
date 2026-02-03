import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { createLogger } from '@/lib/logger';

const authLogger = createLogger('Auth');

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    authLogger.debug({ userId: decoded.id }, 'Token verified successfully');
    return next();
  } catch (err) {
    authLogger.warn({ err }, 'Invalid token attempt');
    return res.status(400).json({ message: 'Invalid token.', err });
  }
};
