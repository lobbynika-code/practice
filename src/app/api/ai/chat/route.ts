import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { aiChat } from '@/lib/ai/provider';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const message = String(b.message || '').slice(0, 4000);
  if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });
  const admin = createAdminClient();
  // Free-tier rate limit: 20 AI messages/day (configurable via subscription plans later).
  const since = new Date(Date.now() - 86400000).toISOString();
  const { count } = await admin.from('ai_messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('role', 'user').gte('created_at', since);
  if ((count || 0) >= 20) return NextResponse.json({ error: 'Daily free AI limit reached. Premium plans coming soon.' }, { status: 429 });
  let conversation = null;
  if (b.conversation_id) { const { data } = await admin.from('ai_conversations').select('id').eq('id', b.conversation_id).eq('user_id', user.id).single(); conversation = data; }
  if (!conversation) { const { data } = await admin.from('ai_conversations').insert({ user_id: user.id, title: message.slice(0, 60), mode: b.mode || 'tutor' }).select().single(); conversation = data; }
  const { data: history } = await admin.from('ai_messages').select('role,content').eq('conversation_id', conversation.id).order('created_at', { ascending: false }).limit(10);
  await admin.from('ai_messages').insert({ conversation_id: conversation.id, user_id: user.id, role: 'user', content: message });
  try {
    const reply = await aiChat([...(history || []).reverse(), { role: 'user', content: message }]);
    await admin.from('ai_messages').insert({ conversation_id: conversation.id, user_id: user.id, role: 'assistant', content: reply });
    return NextResponse.json({ reply, conversation_id: conversation.id });
  } catch (e: any) {
    if (e.message === 'AI_NOT_CONFIGURED') return NextResponse.json({ error: 'AI provider is not configured yet. Set AI_PROVIDER and AI_API_KEY on the server (see .env.example).', code: 'AI_NOT_CONFIGURED' }, { status: 503 });
    return NextResponse.json({ error: 'AI provider error. Please try again.' }, { status: 502 });
  }
}
