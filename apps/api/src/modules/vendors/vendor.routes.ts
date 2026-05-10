import { Router } from 'express';
import { z } from 'zod';
import { VendorModel } from '@fastcopy/database';
import { requireAuth } from '../../middleware/auth';

export const vendorRouter = Router();
const nearbyQuery = z.object({ lng: z.coerce.number().min(-180).max(180), lat: z.coerce.number().min(-90).max(90), radiusMeters: z.coerce.number().min(500).max(25000).default(5000) });

vendorRouter.get('/nearby', requireAuth(['customer']), async (req, res, next) => {
  try {
    const query = nearbyQuery.parse(req.query);
    const vendors = await VendorModel.find({
      approvalStatus: 'approved',
      deletedAt: null,
      'availability.isOpen': true,
      'availability.acceptsNewOrders': true,
      location: { $near: { $geometry: { type: 'Point', coordinates: [query.lng, query.lat] }, $maxDistance: query.radiusMeters } }
    }).limit(30).lean();
    res.json({ vendors });
  } catch (error) { next(error); }
});
