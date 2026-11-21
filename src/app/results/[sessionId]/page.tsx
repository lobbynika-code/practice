'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
export default function Results({ params }: { params: Promise<{ sessionId: string }> }) { const { sessionId } = use(params); const [data, setData] = useState<any>(null);
  useEffect(() => { fetch(`/api/results/${sessionId}`).then(r => r.json()).then(setData); }, [sessionId]);
  if (!data) return <div className="py-16 text-center">Loading results…</div>;
  if (data.error) return <div className="py-16 text-center">{data.error}</div>;
  const s = data.session;
  return <div className="mx-auto max-w-3xl py-10"><h1 className="text-3xl font-extrabold">Your results</h1><div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">{[['Score', `${s.score}/${s.max_score}`], ['Percentage', s.percentage + '%'], ['Correct', s.correct_count], ['Total', s.total_questions]].map(([l, v]) => <div key={l} className="card p-4 text-center"><p className="text-2xl font-extrabold grad-text">{v}</p><p className="text-xs opacity-70">{l}</p></div>)}</div>
  <h2 className="mt-8 font-bold">Question-by-question review</h2>{data.rows.map((r: any, i: number) => <div key={i} className="card mt-4 p-5"><p className="font-semibold">{i + 1}. {r.q?.question_text}</p><ul className="mt-2 space-y-1 text-sm">{r.opts.map((o: any) => <li key={o.id} className={o.is_correct ? 'text-teal-300 font-semibold' : r.ans?.selected_option_id === o.id ? 'text-red-400' : 'opacity-70'}>{o.is_correct ? '✓ ' : r.ans?.selected_option_id === o.id ? '✗ ' : ''}{o.option_text}</li>)}</ul>{r.q?.explanation && <p className="mt-2 text-sm"><b>Explanation:</b> {r.q.explanation}</p>}</div>)}
  <div className="mt-6 flex gap-3"><Link href="/practice" className="btn-primary">Retake / New Exam</Link><Link href="/analytics" className="btn-ghost">View Analytics</Link></div></div>; }
