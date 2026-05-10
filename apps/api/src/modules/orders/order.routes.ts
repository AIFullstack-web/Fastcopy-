import { Router } from 'express';
import { z } from 'zod';
import { createOrderSchema, quoteRequestSchema, OrderStatus } from '@fastcopy/shared';
import { validateBody } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { OrderService } from './order.service';

const service = new OrderService();
export const orderRouter = Router();

orderRouter.post('/quote', requireAuth(['customer']), validateBody(quoteRequestSchema), async (req, res, next) => {
  try { res.json(await service.quote(req.body)); } catch (error) { next(error); }
});

orderRouter.post('/', requireAuth(['customer']), validateBody(createOrderSchema), async (req, res, next) => {
  try { res.status(201).json(await service.create(req.auth!.userId, req.body)); } catch (error) { next(error); }
});

orderRouter.patch('/vendor/:orderId/status', requireAuth(['vendor']), validateBody(z.object({ status: OrderStatus, note: z.string().max(300).optional() })), async (req, res, next) => {
  try { res.json(await service.transition(req.params.orderId, req.auth!.userId, req.body.status, req.body.note)); } catch (error) { next(error); }
});
