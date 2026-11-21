'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
export default function Community() { const [posts, setPosts] = useState<any[]>([]); const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const toast = useToast();
  const load = () => createClient().from('question_comments').select('id,body,created_at,question_id').order('created_at', { ascending: false }).limit(20).then(({ data }) => setPosts(data || []));
  useEffect(() => { load(); }, []);
  const post = async (e: React.FormEvent) => { e.preventDefault(); const s = createClient(); const { data: { user } } = await s.auth.getUser(); if (!user) return toast('Log in to post'); const { error } = await s.from('question_comments').insert({ user_id: user.id, body: `${title}: ${body}` }); if (error) return toast(error.message); setTitle(''); setBody(''); load(); };
  return <div className="mx-auto max-w-3xl py-10"><h1 className="text-3xl font-extrabold">💬 Community Discussion</h1><p className="opacity-70">Share explanations and ask academic questions. Be kind — moderators review reported content.</p>
  <form onSubmit={post} className="card mt-5 space-y-3 p-5"><input className="input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required /><textarea className="input" placeholder="Your question or explanation…" value={body} onChange={e => setBody(e.target.value)} required /><button className="btn-primary">Post</button></form>
  <div className="mt-5 space-y-3">{posts.map(p => <div key={p.id} className="card p-4 text-sm">{p.body}<p className="mt-1 text-xs opacity-60">{new Date(p.created_at).toLocaleString()}</p></div>)}</div></div>; }
