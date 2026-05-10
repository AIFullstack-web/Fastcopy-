import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '@fastcopy/shared';

declare module 'express-serve-static-core' {
  interface Request { auth?: { userId: string; role: UserRole }; }
}

export function requireAuth(roles?: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Missing access token' });
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; role: UserRole };
      if (roles && !roles.includes(payload.role)) return res.status(403).json({ message: 'Forbidden' });
      req.auth = { userId: payload.sub, role: payload.role };
      return next();
    } catch {
      return res.status(401).json({ message: 'Invalid access token' });
    }
  };
}
