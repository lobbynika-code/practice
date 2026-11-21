'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const toast = useToast();
  const submit = async (e: React.FormEvent) => { e.preventDefault(); const { error } = await createClient().auth.signInWithPassword({ email, password }); if (error) return toast(error.message); location.href = '/dashboard'; };
  const reset = async () => { if (!email) return toast('Enter your email first'); const { error } = await createClient().auth.resetPasswordForEmail(email); toast(error ? error.message : 'Password reset email sent'); };
  return <div className="mx-auto max-w-md py-16"><div className="card p-8"><h1 className="text-2xl font-extrabold">Welcome back</h1><form onSubmit={submit} className="mt-6 space-y-4"><input className="input" type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><input className="input" type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /><button className="btn-primary w-full">Log in</button></form><button onClick={reset} className="mt-3 text-sm text-indigo-300">Forgot password?</button><p className="mt-4 text-sm">No account? <a className="text-indigo-300" href="/register">Register free</a></p></div></div>;
}
