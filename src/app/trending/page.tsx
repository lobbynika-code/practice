'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
export default function Trending() { const [qs, setQs] = useState<any[]>([]); const [subjects, setSubjects] = useState<any[]>([]); const [subject, setSubject] = useState('');
  const load = () => fetch(`/api/trending${subject ? `?subject_id=${subject}` : ''}`).then(r => r.json()).then(j => setQs(j.questions || []));
  useEffect(() => { load(); fetch('/api/trending').then(() => {}); import('@/lib/supabase/client').then(m => m.createClient().from('subjects').select('*').then(({ data }) => setSubjects(data || []))); }, []);
  useEffect(() => { load(); }, [subject]);
  return <div className="py-10"><h1 className="text-3xl font-extrabold">🔥 Trending Questions</h1><p className="opacity-70">Ranked transparently by recent attempts, saves, likes and comments (decayed by age).</p>
  <select className="input mt-4 max-w-xs" value={subject} onChange={e => setSubject(e.target.value)}><option value="">All subjects</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
  <div className="mt-6 space-y-4">{qs.map(q => <Link key={q.id} href={`/questions/${q.id}`} className="card block p-5 hover:border-indigo-400"><div className="flex justify-between gap-4"><p className="font-semibold">{q.question_text}</p><span className="text-xs text-orange-300">🔥 {q.score}</span></div><p className="mt-2 text-xs opacity-70">{q.subjects?.name || ''} · {q.topics?.name || ''} · {q.difficulty} · {q.attempts} attempts · {q.comment_count} comments · {new Date(q.created_at).toLocaleDateString()}</p></Link>)}</div></div>; }
