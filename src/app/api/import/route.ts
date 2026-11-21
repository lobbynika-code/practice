import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
// Bulk import: JSON array of {subject_id, question_text, question_type, difficulty, options:[{text,is_correct}], explanation}
export async function POST(req: NextRequest) {
  const s = await createClient(); const { data: { user } } = await s.auth.getUser(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = createAdminClient(); const { data: prof } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (!['admin','teacher'].includes(prof?.role || '')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const b = await req.json().catch(() => ({})); const rows = Array.isArray(b) ? b : b.questions;
  if (!rows?.length) return NextResponse.json({ error: 'Provide a JSON array of questions' }, { status: 400 });
  const errors: string[] = []; let imported = 0;
  for (let i = 0; i < rows.length; i++) { const r = rows[i]; if (!r.subject_id || !r.question_text) { errors.push(`Row ${i + 1}: missing subject_id/question_text`); continue; }
    const { data: q, error } = await admin.from('questions').insert({ subject_id: r.subject_id, topic_id: r.topic_id || null, question_text: r.question_text, question_type: r.question_type || 'multiple_choice', difficulty: r.difficulty || 'medium', explanation: r.explanation || null, created_by: user.id, is_published: !!r.is_published }).select().single();
    if (error) { errors.push(`Row ${i + 1}: ${error.message}`); continue; }
    if (r.options?.length) { const opts = r.options.map((o: any, j: number) => ({ question_id: q.id, option_text: o.text, position: j + 1 })); await admin.from('question_options').insert(opts); const correct = opts.filter((o: any) => o.is_correct).map((o: any) => o.option_text); await admin.from('question_answers').insert({ question_id: q.id, correct_option_ids: correct, correct_text: correct[0] || null }); }
    imported++; }
  return NextResponse.json({ imported, errors });
}
