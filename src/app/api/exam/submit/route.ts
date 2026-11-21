import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { gradeAnswer, pointsForAnswer } from '@/lib/utils';
export const dynamic = 'force-dynamic';

// Grading and rewards run only on the server. Claiming the session prevents duplicate submissions/rewards.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.session_id || typeof b.session_id !== 'string') return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
  const admin = createAdminClient();
  const { data: session } = await admin.from('practice_sessions').select('id,user_id,status')
    .eq('id', b.session_id).eq('user_id', user.id).single();
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (session.status !== 'in_progress') return NextResponse.json({ error: 'This exam has already been submitted or is being submitted.' }, { status: 409 });

  const { data: claimed, error: claimError } = await admin.from('practice_sessions')
    .update({ status: 'submitting' }).eq('id', session.id).eq('user_id', user.id).eq('status', 'in_progress')
    .select('id').maybeSingle();
  if (claimError || !claimed) return NextResponse.json({ error: 'This exam is already being submitted. Refresh your results shortly.' }, { status: 409 });

  try {
    const { data: sq, error: sqError } = await admin.from('practice_session_questions').select('question_id').eq('session_id', session.id);
    if (sqError) throw sqError;
    const qids = (sq || []).map(r => r.question_id);
    if (!qids.length) throw new Error('This exam has no questions.');
    const [{ data: answers, error: answerError }, { data: studentAnswers, error: studentError }, { data: questions, error: questionError }] = await Promise.all([
      admin.from('question_answers').select('question_id,correct_option_ids,correct_text').in('question_id', qids),
      admin.from('student_answers').select('question_id,selected_option_id,selected_text').eq('session_id', session.id).eq('user_id', user.id),
      admin.from('questions').select('id,question_type,marks').in('id', qids)
    ]);
    if (answerError || studentError || questionError) throw answerError || studentError || questionError;
    const answerMap = new Map((answers || []).map(a => [a.question_id, a]));
    const questionMap = new Map((questions || []).map(q => [q.id, q]));
    const studentMap = new Map((studentAnswers || []).map(a => [a.question_id, a]));
    let correct = 0, score = 0, maxScore = 0, points = 0;
    for (const qid of qids) {
      const q = questionMap.get(qid);
      const key = answerMap.get(qid);
      const studentAnswer = studentMap.get(qid);
      const marks = q?.marks ?? 1;
      maxScore += marks;
      const selected = studentAnswer?.selected_option_id || studentAnswer?.selected_text || null;
      const isCorrect = key ? gradeAnswer(selected, key.correct_option_ids || [], q?.question_type || 'multiple_choice') : false;
      if (isCorrect) { correct++; score += marks; }
      points += pointsForAnswer(isCorrect);
      const { error: saveError } = await admin.from('student_answers').upsert({
        session_id: session.id, question_id: qid, user_id: user.id,
        is_correct: isCorrect, marks_awarded: isCorrect ? marks : 0
      }, { onConflict: 'session_id,question_id' });
      if (saveError) throw saveError;
    }
    const percentage = maxScore ? Math.round((score / maxScore) * 100) : 0;
    const { error: finishError } = await admin.from('practice_sessions').update({
      status: 'submitted', score, max_score: maxScore, percentage,
      correct_count: correct, submitted_at: new Date().toISOString()
    }).eq('id', session.id).eq('status', 'submitting');
    if (finishError) throw finishError;
    for (const qid of qids) {
      const { error } = await admin.rpc('increment_attempts', { qid });
      if (error) throw error;
    }
    const { error: pointsError } = await admin.rpc('award_exam_points', { p_session_id: session.id, p_points: points });
    if (pointsError) throw pointsError;
    await admin.from('learning_activity').insert({
      user_id: user.id, activity_type: 'exam_completed',
      metadata: { session_id: session.id, correct, total: qids.length }
    });
    return NextResponse.json({ session_id: session.id, score, max_score: maxScore, percentage, correct, total: qids.length, points_earned: points });
  } catch (error: any) {
    await admin.from('practice_sessions').update({ status: 'in_progress' }).eq('id', session.id).eq('status', 'submitting');
    return NextResponse.json({ error: 'We could not finish grading this exam. Your answers are saved; please try submitting again.' }, { status: 500 });
  }
}
