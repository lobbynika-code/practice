import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
// Bulk import accepts {subject_id, question_text, question_type, difficulty, options:[{text,is_correct}], explanation}.
export async function POST(req: NextRequest) {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = createAdminClient();
  const { data: prof } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (!['admin', 'teacher'].includes(prof?.role || '')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const rows = Array.isArray(b) ? b : b.questions;
  if (!Array.isArray(rows) || !rows.length) return NextResponse.json({ error: 'Provide a JSON array of questions' }, { status: 400 });
  const errors: string[] = [];
  let imported = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r?.subject_id || !r?.question_text) { errors.push(`Row ${i + 1}: missing subject_id/question_text`); continue; }
    const options = Array.isArray(r.options) ? r.options : [];
    if ((r.question_type || 'multiple_choice') === 'multiple_choice' &&
        (!options.length || !options.some((o: any) => o?.is_correct === true))) {
      errors.push(`Row ${i + 1}: multiple-choice questions need options and at least one correct option`);
      continue;
    }
    const { data: q, error } = await admin.from('questions').insert({
      subject_id: r.subject_id, topic_id: r.topic_id || null,
      question_text: r.question_text, question_type: r.question_type || 'multiple_choice',
      difficulty: r.difficulty || 'medium', explanation: r.explanation || null,
      created_by: user.id, is_published: !!r.is_published
    }).select('id').single();
    if (error || !q) { errors.push(`Row ${i + 1}: ${error?.message || 'Question insert failed'}`); continue; }
    if (options.length) {
      const payload = options.map((o: any, j: number) => ({ question_id: q.id, option_text: String(o.text ?? ''), position: j + 1 }));
      const { data: inserted, error: optionError } = await admin.from('question_options').insert(payload).select('id,position');
      if (optionError || !inserted?.length) {
        await admin.from('questions').delete().eq('id', q.id);
        errors.push(`Row ${i + 1}: ${optionError?.message || 'Options could not be saved'}`);
        continue;
      }
      const correctIds = inserted.filter((o: any) => options[o.position - 1]?.is_correct === true).map((o: any) => o.id);
      if (!correctIds.length) {
        await admin.from('questions').delete().eq('id', q.id);
        errors.push(`Row ${i + 1}: no correct option was saved`);
        continue;
      }
      const { error: answerError } = await admin.from('question_answers').insert({ question_id: q.id, correct_option_ids: correctIds, correct_text: null });
      if (answerError) {
        await admin.from('questions').delete().eq('id', q.id);
        errors.push(`Row ${i + 1}: answer key could not be saved`);
        continue;
      }
    } else if (r.correct_text) {
      const { error: answerError } = await admin.from('question_answers').insert({ question_id: q.id, correct_option_ids: [], correct_text: String(r.correct_text) });
      if (answerError) { await admin.from('questions').delete().eq('id', q.id); errors.push(`Row ${i + 1}: ${answerError.message}`); continue; }
    }
    imported++;
  }
  return NextResponse.json({ imported, errors });
}
