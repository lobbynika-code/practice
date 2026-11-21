'use client';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
import { FileText, Image as ImageIcon, Trash2, CheckCircle2, UploadCloud } from 'lucide-react';
export default function Homework() {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedUploadId, setSelectedUploadId] = useState('');
  const [drag, setDrag] = useState(false);
  const [q, setQ] = useState('');
  const [reply, setReply] = useState('');
  const [guided, setGuided] = useState(true);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const load = async () => {
    const { data } = await createClient().from('homework_uploads').select('*').order('created_at', { ascending: false });
    setFiles(data || []);
    if (selectedUploadId && !(data || []).some(f => f.id === selectedUploadId)) setSelectedUploadId('');
  };
  useEffect(() => { load(); }, []);
  const upload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast('File exceeds the 10MB limit.'); return; }
    setBusy(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/homework/upload', { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok) { toast(j.error || 'Upload failed'); return; }
      await load();
      if (j.upload?.id) setSelectedUploadId(j.upload.id);
      toast('Upload complete. It is selected for your next question.');
    } catch { toast('Upload failed. Check your connection and try again.'); }
    finally { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }
  };
  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true); setReply('');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: (guided ? 'Guided learning mode: give hints first, then explain the solution step by step. ' : '') + q,
          mode: 'homework', upload_id: selectedUploadId || undefined
        })
      });
      const j = await res.json();
      setReply(res.ok ? j.reply : j.error || 'AI unavailable');
    } catch { setReply('Could not reach the AI service. Please try again.'); }
    finally { setBusy(false); }
  };
  const del = async (id: string) => {
    const res = await fetch(`/api/homework/upload?id=${id}`, { method: 'DELETE' });
    if (res.ok) { if (selectedUploadId === id) setSelectedUploadId(''); await load(); }
    else toast('Could not delete this file.');
  };
  return <div className="mx-auto max-w-3xl py-10">
    <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-400">Learn by understanding</p><h1 className="mt-2 text-3xl font-extrabold">AI Homework Assistant</h1><p className="muted mt-2 leading-7">Upload a homework page or image, select it, and ask a question. The assistant will use the selected file as context.</p></div>
    <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }} onClick={() => inputRef.current?.click()} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }} role="button" tabIndex={0} aria-label="Upload homework file" className={`card cursor-pointer border-dashed p-8 text-center transition ${drag ? 'border-teal-400 bg-teal-400/5' : 'hover:border-indigo-400/50'}`}>
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-400"><UploadCloud size={26}/></div>
      <p className="mt-4 font-semibold">{busy ? 'Working…' : 'Drop your homework here or browse files'}</p>
      <p className="muted mt-1 text-xs">PDF, PNG or JPG · Maximum 10MB</p>
      <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
    </div>
    {files.length > 0 && <section className="mt-5"><div className="mb-2 flex items-center justify-between"><h2 className="font-bold">Your uploaded files</h2><span className="muted text-xs">Choose one to attach</span></div><div className="space-y-2">{files.map(f => <div key={f.id} className={`card flex items-center gap-3 p-3 ${selectedUploadId === f.id ? 'border-teal-400/70' : ''}`}>
      <button type="button" onClick={() => setSelectedUploadId(selectedUploadId === f.id ? '' : f.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-400">{f.file_type === 'application/pdf' ? <FileText size={19}/> : <ImageIcon size={19}/>}</span>
        <span className="min-w-0"><span className="block truncate text-sm font-semibold">{f.file_name}</span><span className="muted block text-xs">{(f.file_size / 1024).toFixed(0)} KB · {f.status}</span></span>
        {selectedUploadId === f.id && <CheckCircle2 className="ml-auto shrink-0 text-teal-400" size={19}/>}
      </button>
      <button type="button" aria-label={`Delete ${f.file_name}`} onClick={() => del(f.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-400/10"><Trash2 size={17}/></button>
    </div>)}</div></section>}
    <label className="mt-6 flex items-center gap-2 text-sm"><input type="checkbox" checked={guided} onChange={e => setGuided(e.target.checked)}/> Guided learning mode (hints first)</label>
    <form onSubmit={ask} className="mt-3 space-y-3">
      <textarea className="input min-h-28 resize-y" placeholder={selectedUploadId ? 'What would you like to understand from this file?' : 'Type your homework question…'} value={q} onChange={e => setQ(e.target.value)}/>
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="muted text-xs">{selectedUploadId ? 'Selected file will be included with your question.' : 'No file selected. You can still ask a question.'}</span><button className="btn-primary" disabled={busy || !q.trim()}>{busy ? 'Thinking…' : 'Get guided help'}</button></div>
    </form>
    {reply && <div className="card mt-5 whitespace-pre-wrap p-5 text-sm leading-7">{reply}</div>}
  </div>;
}
