import express from 'express';
import cookieParser from 'cookie-parser';
import { applySecurity } from './middleware/security';
import { errorHandler } from './middleware/error-handler';
import { authRouter } from './modules/auth/auth.routes';
import { fileRouter } from './modules/files/file.routes';
import { orderRouter } from './modules/orders/order.routes';
import { vendorRouter } from './modules/vendors/vendor.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';

export function createApp() {
  const app = express();
  applySecurity(app);
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/files', fileRouter);
  app.use('/api/v1/orders', orderRouter);
  app.use('/api/v1/vendors', vendorRouter);
  app.use('/api/v1/admin/analytics', analyticsRouter);
  app.use(errorHandler);
  return app;
}
