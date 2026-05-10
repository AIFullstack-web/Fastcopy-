import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, { cors: { origin: env.WEB_ORIGIN, credentials: true } });
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token as string | undefined;
      if (!token) return next(new Error('Unauthorized'));
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; role: string };
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      socket.join(`user:${payload.sub}`);
      if (payload.role === 'admin') socket.join('admin:orders');
      next();
    } catch { next(new Error('Unauthorized')); }
  });
  io.on('connection', socket => {
    socket.on('order:join', (orderId: string) => socket.join(`order:${orderId}`));
    socket.on('vendor:join', (vendorId: string) => socket.join(`vendor:${vendorId}`));
  });
  return io;
}
