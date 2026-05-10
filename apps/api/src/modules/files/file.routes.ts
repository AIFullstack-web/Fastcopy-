import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { FileService } from './file.service';
const service = new FileService();
export const fileRouter = Router();
fileRouter.post('/presign', requireAuth(['customer']), validateBody(z.object({ filename: z.string().min(1).max(180) })), async (req, res, next) => {
  try { res.json(await service.createSignedUpload(req.auth!.userId, req.body.filename)); } catch (error) { next(error); }
});
fileRouter.post('/download-url', requireAuth(['vendor', 'admin']), validateBody(z.object({ key: z.string().min(8) })), async (req, res, next) => {
  try { res.json({ url: await service.createSignedDownload(req.body.key) }); } catch (error) { next(error); }
});
