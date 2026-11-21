'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GraduationCap, Moon, Sun, Menu, X } from 'lucide-react';
export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const s = createClient();
    s.auth.getUser().then(({ data }) => setUser(data.user));
    const t = localStorage.getItem('vl-theme');
    const isDark = t !== 'light';
    document.documentElement.classList.toggle('dark', isDark);
    setDark(isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('vl-theme', next ? 'dark' : 'light');
  };
  const logout = async () => { await createClient().auth.signOut(); location.href = '/'; };
  const closeMenu = () => setMenuOpen(false);
  return <header className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{borderColor:'var(--line)',background:'color-mix(in srgb, var(--bg) 88%, transparent)'}}>
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
      <Link href="/" onClick={closeMenu} className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-teal-400 text-white"><GraduationCap size={21}/></span>
        Vital<span className="grad-text">Learn</span>
      </Link>
      <div className="hidden items-center gap-7 text-sm font-medium md:flex">
        <Link href="/#features" className="transition hover:text-indigo-400">Features</Link>
        <Link href="/learn" className="transition hover:text-indigo-400">Learning centre</Link>
        <Link href="/trending" className="transition hover:text-indigo-400">Trending</Link>
        <Link href="/pricing" className="transition hover:text-indigo-400">Pricing</Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button onClick={toggle} aria-label="Toggle theme" className="rounded-full border p-2.5 transition hover:bg-indigo-500/10" style={{borderColor:'var(--line)'}}>{dark ? <Sun size={17}/> : <Moon size={17}/>}</button>
        {user ? <><Link href="/dashboard" className="btn-ghost hidden !px-4 !py-2 text-sm sm:inline-flex">Dashboard</Link><button onClick={logout} className="btn-primary hidden !px-4 !py-2 text-sm sm:inline-flex">Logout</button></> : <><Link href="/login" className="btn-ghost hidden !px-4 !py-2 text-sm sm:inline-flex">Sign in</Link><Link href="/register" className="btn-primary hidden !px-4 !py-2 text-sm sm:inline-flex">Start free</Link></>}
        <button onClick={()=>setMenuOpen(v=>!v)} aria-label={menuOpen?'Close menu':'Open menu'} aria-expanded={menuOpen} className="rounded-full border p-2.5 md:hidden" style={{borderColor:'var(--line)'}}>{menuOpen?<X size={18}/>:<Menu size={18}/>}</button>
      </div>
    </nav>
    {menuOpen && <div className="border-t px-4 pb-4 pt-3 md:hidden" style={{borderColor:'var(--line)'}}>
      <div className="mx-auto flex max-w-7xl flex-col gap-1 text-sm font-medium">
        {[["Features","/#features"],["Learning centre","/learn"],["Trending questions","/trending"],["Pricing","/pricing"],[user?"Dashboard":"Sign in",user?"/dashboard":"/login"]].map(([label,href])=><Link key={href} href={href} onClick={closeMenu} className="rounded-xl px-3 py-3 hover:bg-indigo-500/10">{label}</Link>)}
        {user ? <button onClick={logout} className="mt-2 rounded-xl bg-indigo-600 px-4 py-3 text-left font-semibold text-white">Log out</button> : <Link href="/register" onClick={closeMenu} className="mt-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white">Create free account</Link>}
      </div>
    </div>}
  </header>;
}
