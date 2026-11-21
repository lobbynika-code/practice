'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
export default function PracticeSetup() {
  const [subjects, setSubjects] = useState<any[]>([]); const [topics, setTopics] = useState<any[]>([]); const [levels, setLevels] = useState<any[]>([]); const [exams, setExams] = useState<any[]>([]);
  const [subject, setSubject] = useState(''); const [topic, setTopic] = useState(''); const [level, setLevel] = useState(''); const [exam, setExam] = useState(''); const [difficulty, setDifficulty] = useState(''); const [count, setCount] = useState(10); const [timed, setTimed] = useState(false);
  const toast = useToast();
  useEffect(() => { const s = createClient(); s.from('subjects').select('*').then(({ data }) => setSubjects(data || [])); s.from('education_levels').select('*').then(({ data }) => setLevels(data || [])); s.from('examination_types').select('*').then(({ data }) => setExams(data || [])); }, []);
  useEffect(() => { if (subject) createClient().from('topics').select('*').eq('subject_id', subject).then(({ data }) => setTopics(data || [])); }, [subject]);
  const start = async (e: React.FormEvent) => { e.preventDefault(); const res = await fetch('/api/exam/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject_id: subject || undefined, topic_id: topic || undefined, education_level_id: level || undefined, exam_type_id: exam || undefined, difficulty: difficulty || undefined, count, timed, duration_seconds: count * 60 }) }); const j = await res.json(); if (!res.ok) return toast(j.error || 'Could not start exam'); location.href = `/practice/${j.session.id}`; };
  return <div className="mx-auto max-w-2xl py-10"><div className="card p-8"><h1 className="text-2xl font-extrabold">Configure your practice exam</h1><form onSubmit={start} className="mt-6 space-y-4">
    <select className="input" value={subject} onChange={e => setSubject(e.target.value)}><option value="">All subjects (mixed)</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
    <select className="input" value={topic} onChange={e => setTopic(e.target.value)}><option value="">All topics</option>{topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
    <select className="input" value={level} onChange={e => setLevel(e.target.value)}><option value="">All education levels</option>{levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
    <select className="input" value={exam} onChange={e => setExam(e.target.value)}><option value="">All exam types</option>{exams.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
    <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="">Any difficulty</option><option>easy</option><option>medium</option><option>hard</option></select>
    <label className="block text-sm">Number of questions <input className="input mt-1" type="number" min={1} max={50} value={count} onChange={e => setCount(Number(e.target.value))} /></label>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} /> Timed exam (1 min per question)</label>
    <button className="btn-primary w-full">Start Exam →</button></form></div></div>;
}
