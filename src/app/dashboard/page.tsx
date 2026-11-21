'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import { computeStreak, pct } from '@/lib/utils';
import Link from 'next/link';
export default function Dashboard() {
  const [data, setData] = useState<any>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { const s = createClient(); const { data: { user } } = await s.auth.getUser(); if (!user) return;
    const { data: profile } = await s.from('profiles').select('*').eq('id', user.id).single();
    const { data: sessions } = await s.from('practice_sessions').select('*').eq('user_id', user.id).eq('status', 'submitted').order('submitted_at', { ascending: false });
    const { data: activity } = await s.from('learning_activity').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(90);
    const totalQ = (sessions || []).reduce((a, x) => a + (x.total_questions || 0), 0); const correct = (sessions || []).reduce((a, x) => a + (x.correct_count || 0), 0);
    setData({ profile, sessions: sessions || [], totalQ, correct, streak: computeStreak((activity || []).map(a => a.created_at)) }); setLoading(false); })(); }, []);
  if (loading) return <div className="py-10 space-y-4"><Skeleton className="h-10 w-64" /><div className="grid md:grid-cols-4 gap-4"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div></div>;
  if (!data?.profile?.onboarding_done) return <div className="py-10"><EmptyState title="Complete your onboarding" body="Tell us your education level and subjects so we can personalise your dashboard." action={<Link href="/onboarding" className="btn-primary">Start onboarding →</Link>} /></div>;
  const name = data.profile.full_name?.split(' ')[0] || 'Learner';
  return <div className="py-10 fade-up"><h1 className="text-3xl font-extrabold">Welcome back, {name}! 👋</h1><p className="opacity-70">Keep learning — you're doing great!</p>
    <div className="mt-6 grid gap-4 md:grid-cols-4">{[['Overall accuracy', pct(data.correct, data.totalQ) + '%'], ['Questions attempted', data.totalQ], ['Study streak', data.streak + ' days'], ['Points', data.profile.points || 0]].map(([l, v]) => <Card key={l}><p className="text-3xl font-extrabold grad-text">{v}</p><p className="text-sm opacity-70">{l}</p></Card>)}</div>
    <div className="mt-6 grid gap-4 md:grid-cols-2"><Card><h2 className="font-bold">Quick access</h2><div className="mt-3 flex flex-wrap gap-3"><Link href="/practice" className="btn-primary !px-4 !py-2 text-sm">Practice Exam</Link><Link href="/trending" className="btn-ghost !px-4 !py-2 text-sm">Trending Questions</Link><Link href="/ai-tutor" className="btn-ghost !px-4 !py-2 text-sm">AI Tutor</Link><Link href="/homework" className="btn-ghost !px-4 !py-2 text-sm">Homework Assistant</Link></div></Card>
    <Card><h2 className="font-bold">Recent sessions</h2>{data.sessions.length === 0 ? <p className="mt-2 text-sm opacity-70">No sessions yet. Start your first practice exam!</p> : <ul className="mt-2 space-y-2 text-sm">{data.sessions.slice(0, 5).map((s: any) => <li key={s.id} className="flex justify-between"><span>{s.total_questions} questions</span><Link className="text-indigo-300" href={`/results/${s.id}`}>{s.percentage}% →</Link></li>)}</ul>}</Card></div></div>;
}
