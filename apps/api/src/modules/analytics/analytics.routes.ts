import { Router } from 'express';
import { analyticsPipelines } from '@fastcopy/database/analytics.examples';
import { requireAuth } from '../../middleware/auth';
export const analyticsRouter = Router();
analyticsRouter.get('/', requireAuth(['admin']), async (_req, res, next) => {
  try {
    const [dailyRevenue, vendorPerformance] = await Promise.all([analyticsPipelines.dailyRevenue(30), analyticsPipelines.vendorPerformance()]);
    res.json({ dailyRevenue, vendorPerformance });
  } catch (error) { next(error); }
});
