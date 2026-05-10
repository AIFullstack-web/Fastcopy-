'use client';
import { motion } from 'framer-motion';
import { create } from 'zustand';
import type { OrderStatus } from '@fastcopy/shared';

const columns: OrderStatus[] = ['new', 'accepted', 'printing', 'binding', 'ready', 'delivered'];
type Card = { id: string; title: string; total: number; status: OrderStatus };
const seed: Card[] = [{ id: 'FC-DEMO-1', title: 'Assignment bundle', total: 240, status: 'new' }, { id: 'FC-DEMO-2', title: 'Spiral notes', total: 180, status: 'printing' }];
const useKanban = create<{ cards: Card[]; move: (id: string, status: OrderStatus) => void }>(set => ({ cards: seed, move: (id, status) => set(state => ({ cards: state.cards.map(card => card.id === id ? { ...card, status } : card) })) }));

export function VendorKanban() {
  const { cards, move } = useKanban();
  return <div className="grid gap-4 overflow-x-auto md:grid-cols-3 xl:grid-cols-6">{columns.map(column => <section key={column} className="glass-card min-h-80 rounded-3xl p-4"><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{column.replaceAll('_', ' ')}</h3><div className="space-y-3">{cards.filter(card => card.status === column).map(card => <motion.article layout key={card.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-white/10"><p className="text-sm font-semibold">{card.title}</p><p className="mt-1 text-xs text-slate-500">{card.id} · ₹{card.total}</p><select className="mt-3 w-full rounded-xl border bg-transparent p-2 text-xs" value={card.status} onChange={event => move(card.id, event.target.value as OrderStatus)}>{columns.map(status => <option key={status} value={status}>{status}</option>)}</select></motion.article>)}</div></section>)}</div>;
}
