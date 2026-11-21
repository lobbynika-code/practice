import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
// Post-submission review only: correct answers are released here, server-side, for the session owner.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = createAdminClient();
  const { data: session } = await admin.from('practice_sessions').select('*').eq('id', sessionId).eq('user_id', user.id).single();
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session.status !== 'submitted') return NextResponse.json({ error: 'Session not submitted yet' }, { status: 400 });
  const { data: sq } = await admin.from('practice_session_questions').select('question_id,position').eq('session_id', sessionId).order('position');
  const ids = (sq || []).map(r => r.question_id);
  const { data: qs } = await admin.from('questions').select('id,question_text,explanation').in('id', ids);
  const { data: opts } = await admin.from('question_options').select('id,question_id,option_text').in('question_id', ids);
  const { data: ans } = await admin.from('question_answers').select('question_id,correct_option_ids').in('question_id', ids);
  const { data: sa } = await admin.from('student_answers').select('*').eq('session_id', sessionId);
  const rows = (sq || []).map(r => { const correctIds = (ans || []).find(a => a.question_id === r.question_id)?.correct_option_ids || []; return { q: (qs || []).find(x => x.id === r.question_id), opts: (opts || []).filter(o => o.question_id === r.question_id).map(o => ({ ...o, is_correct: correctIds.includes(o.id) })), ans: (sa || []).find(a => a.question_id === r.question_id) }; });
  return NextResponse.json({ session, rows });
}
