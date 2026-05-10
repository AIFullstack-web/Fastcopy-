import compression from 'compression';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import type { Express } from 'express';
import { env, isProduction } from '../config/env';

export function applySecurity(app: Express) {
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: [env.WEB_ORIGIN], credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }));
  app.use(compression());
  app.use(mongoSanitize());
  app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));
}
