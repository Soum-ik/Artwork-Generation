import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyJWT } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: { userId: string };
}

export const authMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication invalid, no token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication invalid, token malformed' });
    return;
  }

  try {
    const payload = verifyJWT(token) as { userId: string };
    (req as AuthRequest).user = { userId: payload.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication invalid, token failed' });
  }
}; 