'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
export default function Register() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const toast = useToast();
  const submit = async (e: React.FormEvent) => { e.preventDefault(); const s = createClient(); const { data, error } = await s.auth.signUp({ email, password, options: { data: { full_name: name } } }); if (error) return toast(error.message); if (data.user) await s.from('profiles').insert({ id: data.user.id, full_name: name }); toast('Account created — please verify your email if prompted, then continue to onboarding.'); location.href = '/onboarding'; };
  return <div className="mx-auto max-w-md py-16"><div className="card p-8"><h1 className="text-2xl font-extrabold">Create your account</h1><p className="mt-1 text-sm opacity-70">Free forever for core practice.</p><form onSubmit={submit} className="mt-6 space-y-4"><input className="input" required placeholder="Full name" value={name} onChange={e => setName(e.target.value)} /><input className="input" type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><input className="input" type="password" required minLength={6} placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} /><button className="btn-primary w-full">Register Free</button></form><p className="mt-4 text-sm">Already registered? <a className="text-indigo-300" href="/login">Log in</a></p></div></div>;
}
