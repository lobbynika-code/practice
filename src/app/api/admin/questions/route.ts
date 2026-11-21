import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
async function requireAdmin() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin' || data?.role === 'teacher' ? user : null;
}
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  if (!b.question_text || !b.subject_id) return NextResponse.json({ error: 'question_text and subject_id required' }, { status: 400 });
  const options = Array.isArray(b.options) ? b.options : [];
  if ((b.question_type || 'multiple_choice') === 'multiple_choice' &&
      (!options.length || !options.some((o: any) => o?.is_correct === true))) {
    return NextResponse.json({ error: 'Multiple-choice questions need options and at least one correct option.' }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data: q, error } = await admin.from('questions').insert({
    subject_id: b.subject_id, topic_id: b.topic_id || null,
    education_level_id: b.education_level_id || null, exam_type_id: b.exam_type_id || null,
    question_text: b.question_text, question_type: b.question_type || 'multiple_choice',
    difficulty: b.difficulty || 'medium', marks: b.marks || 1,
    explanation: b.explanation || null, image_url: b.image_url || null,
    source: b.source || null, created_by: user.id, is_published: !!b.is_published
  }).select().single();
  if (error || !q) return NextResponse.json({ error: error?.message || 'Question creation failed' }, { status: 500 });
  if (options.length) {
    const payload = options.map((o: any, i: number) => ({ question_id: q.id, option_text: String(o.text ?? ''), position: i + 1 }));
    const { data: inserted, error: optionError } = await admin.from('question_options').insert(payload).select('id,position');
    if (optionError || !inserted?.length) {
      await admin.from('questions').delete().eq('id', q.id);
      return NextResponse.json({ error: optionError?.message || 'Options could not be saved' }, { status: 500 });
    }
    const correctIds = inserted.filter((o: any) => options[o.position - 1]?.is_correct === true).map((o: any) => o.id);
    if (!correctIds.length) {
      await admin.from('questions').delete().eq('id', q.id);
      return NextResponse.json({ error: 'At least one correct option is required.' }, { status: 400 });
    }
    const { error: answerError } = await admin.from('question_answers').insert({ question_id: q.id, correct_option_ids: correctIds, correct_text: null });
    if (answerError) {
      await admin.from('questions').delete().eq('id', q.id);
      return NextResponse.json({ error: answerError.message }, { status: 500 });
    }
  } else if (b.correct_text) {
    const { error: answerError } = await admin.from('question_answers').insert({ question_id: q.id, correct_option_ids: [], correct_text: String(b.correct_text) });
    if (answerError) { await admin.from('questions').delete().eq('id', q.id); return NextResponse.json({ error: answerError.message }, { status: 500 }); }
  }
  return NextResponse.json({ question: q });
}
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const admin = createAdminClient();
  const { data } = await admin.from('questions').select('id,question_text,difficulty,is_published,created_at').order('created_at', { ascending: false }).limit(50);
  return NextResponse.json({ questions: data || [] });
}
