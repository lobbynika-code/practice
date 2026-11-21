'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
export default function Onboarding() {
  const [levels, setLevels] = useState<any[]>([]); const [subjects, setSubjects] = useState<any[]>([]);
  const [country, setCountry] = useState('Ghana'); const [level, setLevel] = useState(''); const [exam, setExam] = useState('WASSCE'); const [school, setSchool] = useState(''); const [picked, setPicked] = useState<string[]>([]);
  const toast = useToast();
  useEffect(() => { const s = createClient(); s.from('education_levels').select('*').then(({ data }) => setLevels(data || [])); s.from('subjects').select('*').then(({ data }) => setSubjects(data || [])); }, []);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); const s = createClient(); const { data: { user } } = await s.auth.getUser(); if (!user) return toast('Please log in first'); const { error } = await s.from('profiles').update({ country, education_level_id: level || null, exam_system: exam, school: school || null, onboarding_done: true }).eq('id', user.id); if (error) return toast(error.message); if (picked.length) await s.from('user_preferences').insert(picked.map(subject_id => ({ user_id: user.id, subject_id }))); location.href = '/dashboard'; };
  return <div className="mx-auto max-w-2xl py-12"><div className="card p-8"><h1 className="text-2xl font-extrabold">Tell us about your learning</h1><form onSubmit={submit} className="mt-6 space-y-4">
    <input className="input" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
    <select className="input" value={level} onChange={e => setLevel(e.target.value)}><option value="">Education level (optional)</option>{levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
    <input className="input" placeholder="School / institution (optional)" value={school} onChange={e => setSchool(e.target.value)} />
    <select className="input" value={exam} onChange={e => setExam(e.target.value)}><option>BECE</option><option>WASSCE</option><option>University</option><option>Professional</option><option>General practice</option></select>
    <div><p className="mb-2 text-sm font-semibold">Subjects of interest</p><div className="flex flex-wrap gap-2">{subjects.map(s => <button type="button" key={s.id} onClick={() => setPicked(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])} className={`rounded-full px-4 py-2 text-sm border ${picked.includes(s.id) ? 'bg-indigo-600 text-white' : 'border-indigo-400/40'}`}>{s.name}</button>)}</div></div>
    <button className="btn-primary w-full">Complete onboarding →</button></form></div></div>;
}
