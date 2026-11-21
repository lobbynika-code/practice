'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GraduationCap, Moon, Sun } from 'lucide-react';
export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [dark, setDark] = useState(true);
  useEffect(() => { const s = createClient(); s.auth.getUser().then(({ data }) => setUser(data.user)); const t = localStorage.getItem('vl-theme'); if (t === 'light') { document.documentElement.classList.remove('dark'); setDark(false); } else document.documentElement.classList.add('dark'); }, []);
  const toggle = () => { const d = !dark; setDark(d); document.documentElement.classList.toggle('dark', d); localStorage.setItem('vl-theme', d ? 'dark' : 'light'); };
  const logout = async () => { await createClient().auth.signOut(); location.href = '/'; };
  return <header className="sticky top-0 z-40 border-b border-indigo-500/20 bg-ink/80 backdrop-blur dark:bg-ink/80 bg-white/80"><nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
    <Link href="/" className="flex items-center gap-2 font-extrabold text-lg"><GraduationCap className="text-teal-300" /> VitalLearn</Link>
    <div className="hidden md:flex gap-6 text-sm font-medium"><Link href="/#features">Features</Link><Link href="/learn">Learn</Link><Link href="/trending">Trending</Link><Link href="/pricing">Pricing</Link></div>
    <div className="flex items-center gap-3"><button onClick={toggle} aria-label="Toggle theme" className="rounded-full border border-indigo-400/40 p-2">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
    {user ? <><Link href="/dashboard" className="btn-ghost !px-4 !py-2 text-sm">Dashboard</Link><button onClick={logout} className="btn-primary !px-4 !py-2 text-sm">Logout</button></> : <><Link href="/login" className="btn-ghost !px-4 !py-2 text-sm">Sign in</Link><Link href="/register" className="btn-primary !px-4 !py-2 text-sm">Start Free</Link></>}
    </div></nav></header>;
}
