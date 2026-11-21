'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
export default function Profile() { const [p, setP] = useState<any>(null); const [name, setName] = useState(''); const [school, setSchool] = useState(''); const toast = useToast();
  useEffect(() => { (async () => { const s = createClient(); const { data: { user } } = await s.auth.getUser(); const { data } = await s.from('profiles').select('*').eq('id', user?.id).single(); setP(data); setName(data?.full_name || ''); setSchool(data?.school || ''); })(); }, []);
  const save = async () => { const s = createClient(); const { data: { user } } = await s.auth.getUser(); const { error } = await s.from('profiles').update({ full_name: name, school }).eq('id', user?.id); toast(error ? error.message : 'Profile saved ✓'); };
  if (!p) return <div className="py-16 text-center">Loading…</div>;
  return <div className="mx-auto max-w-xl py-10"><div className="card p-8"><h1 className="text-2xl font-extrabold">My Profile</h1><p className="text-sm opacity-70">{p.role} · {p.points} points</p><div className="mt-5 space-y-4"><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" /><input className="input" value={school} onChange={e => setSchool(e.target.value)} placeholder="School / institution" /><button className="btn-primary" onClick={save}>Save profile</button></div></div></div>; }
