import http from 'node:http';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { createSocketServer } from './realtime/socket';

await connectDatabase();
const httpServer = http.createServer(createApp());
createSocketServer(httpServer);
httpServer.listen(env.API_PORT, () => console.log(`Fastcopy API listening on ${env.API_PORT}`));
