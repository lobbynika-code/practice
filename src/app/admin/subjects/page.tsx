'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
export default function AdminSubjects() { const [rows, setRows] = useState<any[]>([]); const [name, setName] = useState(''); const [cat, setCat] = useState('Sciences'); const toast = useToast();
  const load = () => createClient().from('subjects').select('*').order('name').then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);
  const add = async (e: React.FormEvent) => { e.preventDefault(); const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-'); const { error } = await createClient().from('subjects').insert({ name, slug, category: cat }); toast(error ? error.message : 'Subject added ✓'); setName(''); load(); };
  return <div className="py-10"><h1 className="text-3xl font-extrabold">Manage Subjects</h1><form onSubmit={add} className="card mt-6 flex gap-3 p-5"><input className="input" placeholder="Subject name" value={name} onChange={e => setName(e.target.value)} required /><select className="input max-w-xs" value={cat} onChange={e => setCat(e.target.value)}><option>Sciences</option><option>Languages & Humanities</option><option>Other</option></select><button className="btn-primary">Add</button></form><div className="mt-5 space-y-2">{rows.map(s => <div key={s.id} className="card p-3 text-sm">{s.name} · {s.category}</div>)}</div></div>; }
