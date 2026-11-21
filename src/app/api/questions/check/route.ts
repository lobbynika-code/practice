import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
// Single-question attempt: correct answer is checked server-side only.
export async function POST(req: NextRequest) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.question_id || !b.selected_option_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const admin = createAdminClient();
  const { data: ans } = await admin.from('question_answers').select('correct_option_ids').eq('question_id', b.question_id).single();
  const { data: q } = await admin.from('questions').select('explanation').eq('id', b.question_id).single();
  const correct = (ans?.correct_option_ids || []).includes(b.selected_option_id);
  await admin.from('student_answers').insert({ question_id: b.question_id, user_id: user.id, selected_option_id: b.selected_option_id, is_correct: correct });
  await admin.rpc('increment_attempts', { qid: b.question_id });
  if (correct) await admin.rpc('add_points', { uid: user.id, pts: 10 });
  return NextResponse.json({ correct, explanation: q?.explanation || null });
}
