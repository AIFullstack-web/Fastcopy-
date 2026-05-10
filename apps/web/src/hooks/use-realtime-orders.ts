'use client';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useRealtimeOrders(token?: string, onOrderEvent?: (event: unknown) => void) {
  useEffect(() => {
    if (!token) return;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000', { auth: { token } });
    socket.on('order:update', onOrderEvent ?? (() => undefined));
    return () => { socket.disconnect(); };
  }, [token, onOrderEvent]);
}
