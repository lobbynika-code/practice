import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.session_id || !b.question_id) return NextResponse.json({ error: 'Missing session_id/question_id' }, { status: 400 });
  const admin = createAdminClient();
  const { data: session } = await admin.from('practice_sessions').select('id,status').eq('id', b.session_id).eq('user_id', user.id).single();
  if (!session || session.status !== 'in_progress') return NextResponse.json({ error: 'Session not active' }, { status: 400 });
  const { error } = await admin.from('student_answers').upsert({ session_id: b.session_id, question_id: b.question_id, user_id: user.id, selected_option_id: b.selected_option_id || null, selected_text: b.selected_text || null, marked_for_review: !!b.marked_for_review }, { onConflict: 'session_id,question_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
