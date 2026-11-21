'use client';
import React, { createContext, useContext, useState } from 'react';
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`card p-5 ${className}`}>{children}</div>; }
export function Badge({ children }: { children: React.ReactNode }) { return <span className="inline-flex rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">{children}</span>; }
export function Skeleton({ className = '' }: { className?: string }) { return <div className={`skeleton ${className}`} />; }
export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) { return <div className="card p-8 text-center"><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm opacity-70">{body}</p>{action && <div className="mt-4">{action}</div>}</div>; }
const ToastCtx = createContext<(m: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msgs, setMsgs] = useState<string[]>([]);
  const push = (m: string) => { setMsgs(s => [...s, m]); setTimeout(() => setMsgs(s => s.slice(1)), 3500); };
  return <ToastCtx.Provider value={push}><div className="fixed bottom-4 right-4 z-50 space-y-2">{msgs.map((m, i) => <div key={i} className="rounded-xl bg-indigo-600 px-4 py-3 text-sm text-white shadow-lg">{m}</div>)}</div>{children}</ToastCtx.Provider>;
}
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}><div className="card w-full max-w-md p-6" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between"><h3 className="font-bold">{title}</h3><button onClick={onClose} aria-label="Close">✕</button></div><div className="mt-4">{children}</div></div></div>;
}
