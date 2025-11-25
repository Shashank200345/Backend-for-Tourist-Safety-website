import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/sessionService';

const sessionService = new SessionService();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    touristId: string;
    blockchainId: string;
  };
}

/**
 * Middleware to authenticate requests using JWT token
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const session = await sessionService.verifySession(token);

    if (!session) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = {
      id: session.id,
      touristId: session.touristId,
      blockchainId: session.blockchainId,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}



