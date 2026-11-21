import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { gradeAnswer, pointsForAnswer } from '@/lib/utils';
export const dynamic = 'force-dynamic';
// Server-side grading: correct answers are read only here, never sent to the browser before submission.
export async function POST(req: NextRequest) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const admin = createAdminClient();
  const { data: session } = await admin.from('practice_sessions').select('*').eq('id', b.session_id).eq('user_id', user.id).single();
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (session.status === 'submitted') return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
  const { data: sq } = await admin.from('practice_session_questions').select('question_id').eq('session_id', session.id);
  const qids = (sq || []).map(r => r.question_id);
  const { data: answers } = await admin.from('question_answers').select('question_id,correct_option_ids,correct_text').in('question_id', qids);
  const { data: studentAnswers } = await admin.from('student_answers').select('*').eq('session_id', session.id);
  const { data: questions } = await admin.from('questions').select('id,question_type,marks').in('id', qids);
  const ansMap = new Map((answers || []).map(a => [a.question_id, a]));
  const qMap = new Map((questions || []).map(q => [q.id, q]));
  let correct = 0, score = 0, maxScore = 0, points = 0;
  for (const qid of qids) {
    const q = qMap.get(qid); const a = ansMap.get(qid); const sa = (studentAnswers || []).find(s => s.question_id === qid);
    const marks = q?.marks ?? 1; maxScore += marks;
    const isCorrect = a ? gradeAnswer(sa?.selected_option_id || sa?.selected_text || null, a.correct_option_ids || [], q?.question_type || 'multiple_choice') : false;
    if (isCorrect) { correct++; score += marks; }
    points += pointsForAnswer(isCorrect);
    await admin.from('student_answers').upsert({ session_id: session.id, question_id: qid, user_id: user.id, is_correct: isCorrect, marks_awarded: isCorrect ? marks : 0 }, { onConflict: 'session_id,question_id' });
    await admin.rpc('increment_attempts', { qid });
  }
  const pctScore = maxScore ? Math.round((score / maxScore) * 100) : 0;
  await admin.from('practice_sessions').update({ status: 'submitted', score, max_score: maxScore, percentage: pctScore, correct_count: correct, submitted_at: new Date().toISOString() }).eq('id', session.id);
  await admin.from('points_transactions').insert({ user_id: user.id, points, reason: 'exam_submission', reference_id: session.id });
  await admin.rpc('add_points', { uid: user.id, pts: points });
  await admin.from('learning_activity').insert({ user_id: user.id, activity_type: 'exam_completed', metadata: { session_id: session.id, correct, total: qids.length } });
  return NextResponse.json({ session_id: session.id, score, max_score: maxScore, percentage: pctScore, correct, total: qids.length, points_earned: points });
}
