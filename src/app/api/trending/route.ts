import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { trendingScore } from '@/lib/utils';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const admin = createAdminClient();
  const subject = req.nextUrl.searchParams.get('subject_id');
  let q = admin.from('questions').select('id,subject_id,topic_id,question_text,difficulty,attempts,saves,likes,created_at,subjects(name),topics(name)').eq('is_published', true).order('created_at', { ascending: false }).limit(100);
  if (subject) q = q.eq('subject_id', subject);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: comments } = await admin.from('question_comments').select('question_id');
  const cMap = new Map<string, number>(); (comments || []).forEach(c => cMap.set(c.question_id, (cMap.get(c.question_id) || 0) + 1));
  const ranked = (data || []).map(r => ({ ...r, comment_count: cMap.get(r.id) || 0, score: trendingScore({ attempts: r.attempts || 0, saves: r.saves || 0, likes: r.likes || 0, comments: cMap.get(r.id) || 0, createdAt: r.created_at }) })).sort((a, b) => b.score - a.score).slice(0, 20);
  return NextResponse.json({ questions: ranked });
}
