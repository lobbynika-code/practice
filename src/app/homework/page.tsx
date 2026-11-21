'use client';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
export default function Homework() { const [files, setFiles] = useState<any[]>([]); const [drag, setDrag] = useState(false); const [q, setQ] = useState(''); const [reply, setReply] = useState(''); const [guided, setGuided] = useState(true); const toast = useToast(); const inputRef = useRef<HTMLInputElement>(null);
  const load = () => createClient().from('homework_uploads').select('*').order('created_at', { ascending: false }).then(({ data }) => setFiles(data || []));
  useEffect(() => { load(); }, []);
  const upload = async (file: File) => { const fd = new FormData(); fd.append('file', file); const res = await fetch('/api/homework/upload', { method: 'POST', body: fd }); const j = await res.json(); toast(res.ok ? 'Uploaded securely ✓' : j.error || 'Upload failed'); load(); };
  const ask = async (e: React.FormEvent) => { e.preventDefault(); const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: (guided ? 'Guided mode — give hints first, then a step-by-step explanation: ' : '') + q, mode: 'homework' }) }); const j = await res.json(); setReply(res.ok ? j.reply : j.error || 'AI unavailable'); };
  const del = async (id: string) => { await fetch(`/api/homework/upload?id=${id}`, { method: 'DELETE' }); load(); };
  return <div className="mx-auto max-w-3xl py-10"><h1 className="text-3xl font-extrabold">📚 AI Homework Assistant</h1><p className="opacity-70">Upload homework (PDF, PNG, JPG up to 10MB) or type a question. Guided mode gives hints before full solutions.</p>
  <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }} onClick={() => inputRef.current?.click()} className={`card mt-5 cursor-pointer border-dashed p-10 text-center ${drag ? 'border-teal-400' : ''}`}><p className="text-3xl">☁️</p><p className="mt-2 font-semibold">Drag & drop your file here, or click to browse</p><input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} /></div>
  <div className="mt-4 space-y-2">{files.map(f => <div key={f.id} className="card flex items-center justify-between p-3 text-sm"><span>{f.file_name} · {(f.file_size / 1024).toFixed(0)} KB · {f.status}</span><button className="text-red-400" onClick={() => del(f.id)}>Delete</button></div>)}</div>
  <label className="mt-5 flex items-center gap-2 text-sm"><input type="checkbox" checked={guided} onChange={e => setGuided(e.target.checked)} /> Guided learning mode (hints first)</label>
  <form onSubmit={ask} className="mt-3 flex gap-2"><input className="input" placeholder="Ask about your homework…" value={q} onChange={e => setQ(e.target.value)} /><button className="btn-primary !px-5">Get Help</button></form>
  {reply && <div className="card mt-4 whitespace-pre-wrap p-5 text-sm">{reply}</div>}</div>; }
