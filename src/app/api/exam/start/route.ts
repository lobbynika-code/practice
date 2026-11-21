import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const count = Math.min(Math.max(Number(b.count) || 10, 1), 50);
  const admin = createAdminClient();
  let q = admin.from('questions').select('id,subject_id,topic_id,question_text,question_type,difficulty,marks,image_url').eq('is_published', true);
  if (b.subject_id) q = q.eq('subject_id', b.subject_id);
  if (b.topic_id) q = q.eq('topic_id', b.topic_id);
  if (b.difficulty) q = q.eq('difficulty', b.difficulty);
  if (b.education_level_id) q = q.eq('education_level_id', b.education_level_id);
  if (b.exam_type_id) q = q.eq('exam_type_id', b.exam_type_id);
  const { data: questions, error } = await q.limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!questions?.length) return NextResponse.json({ error: 'No questions match your selection yet.' }, { status: 400 });
  const picked = [...questions].sort(() => Math.random() - 0.5).slice(0, count);
  const { data: session, error: sErr } = await admin.from('practice_sessions').insert({ user_id: user.id, subject_id: b.subject_id || null, timed: !!b.timed, duration_seconds: b.timed ? Number(b.duration_seconds) || 1800 : null, total_questions: picked.length, status: 'in_progress' }).select().single();
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });
  await admin.from('practice_session_questions').insert(picked.map((p, i) => ({ session_id: session.id, question_id: p.id, position: i + 1 })));
  const ids = picked.map(p => p.id);
  const { data: options } = await admin.from('question_options').select('id,question_id,option_text,position').in('question_id', ids).order('position');
  const withOptions = picked.map(p => ({ ...p, options: (options || []).filter(o => o.question_id === p.id) }));
  return NextResponse.json({ session, questions: withOptions });
}
