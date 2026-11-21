'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
export default function Settings() { const [pub, setPub] = useState(true); const toast = useToast();
  useEffect(() => { (async () => { const s = createClient(); const { data: { user } } = await s.auth.getUser(); const { data } = await s.from('profiles').select('is_public').eq('id', user?.id).single(); setPub(data?.is_public ?? true); })(); }, []);
  const toggle = async () => { const s = createClient(); const { data: { user } } = await s.auth.getUser(); const { error } = await s.from('profiles').update({ is_public: !pub }).eq('id', user?.id); if (!error) { setPub(!pub); toast('Privacy preference saved ✓'); } };
  const del = async () => { if (!confirm('Delete your account? This is permanent.')) return; const s = createClient(); const { data: { user } } = await s.auth.getUser(); await s.from('profiles').delete().eq('id', user?.id); await s.auth.signOut(); location.href = '/'; };
  return <div className="mx-auto max-w-xl py-10"><div className="card p-8"><h1 className="text-2xl font-extrabold">Settings</h1><label className="mt-5 flex items-center gap-2 text-sm"><input type="checkbox" checked={pub} onChange={toggle} /> Show my profile on public leaderboards</label><p className="mt-2 text-xs opacity-60">Appearance, subjects and education level can be updated in Profile / Onboarding. Notification and AI preferences are stored per-account.</p><button className="mt-8 rounded-full border border-red-400 px-5 py-2 text-sm text-red-400" onClick={del}>Delete my account</button></div></div>; }
