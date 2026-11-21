import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin.from('profiles').select('id,full_name,points,avatar_url').eq('is_public', true).order('points', { ascending: false }).limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leaderboard: data || [] });
}
