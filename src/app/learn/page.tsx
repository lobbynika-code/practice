'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
export default function Learn() { const [subjects, setSubjects] = useState<any[]>([]); useEffect(() => { createClient().from('subjects').select('*').order('name').then(({ data }) => setSubjects(data || [])); }, []);
  return <div className="py-10"><h1 className="text-3xl font-extrabold">Learning Centre</h1><p className="opacity-70">Browse subjects, topics and lessons.</p><div className="mt-6 grid gap-4 md:grid-cols-3">{subjects.map(s => <Link key={s.id} href={`/learn/${s.slug}`} className="card p-6 hover:border-indigo-400"><h2 className="font-bold">{s.name}</h2><p className="text-sm opacity-70">{s.category}</p><p className="mt-2 text-sm">{s.description}</p></Link>)}</div></div>; }
