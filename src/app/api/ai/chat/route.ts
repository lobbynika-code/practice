import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { aiChat, aiHomework } from '@/lib/ai/provider';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const message = String(b.message || '').trim().slice(0, 4000);
  if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });
  const admin = createAdminClient();
  const since = new Date(Date.now() - 86400000).toISOString();
  const { count } = await admin.from('ai_messages').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('role', 'user').gte('created_at', since);
  if ((count || 0) >= 20) return NextResponse.json({ error: 'Daily free AI limit reached. Premium plans coming soon.' }, { status: 429 });

  let conversation = null;
  if (b.conversation_id) {
    const { data } = await admin.from('ai_conversations').select('id')
      .eq('id', b.conversation_id).eq('user_id', user.id).single();
    conversation = data;
  }
  if (!conversation) {
    const { data } = await admin.from('ai_conversations').insert({
      user_id: user.id, title: message.slice(0, 60), mode: b.mode || 'tutor'
    }).select().single();
    conversation = data;
  }
  if (!conversation) return NextResponse.json({ error: 'Could not create conversation' }, { status: 500 });
  const { data: history } = await admin.from('ai_messages').select('role,content')
    .eq('conversation_id', conversation.id).order('created_at', { ascending: false }).limit(10);
  const messages = [...(history || []).reverse(), { role: 'user' as const, content: message }];
  const { error: saveUserError } = await admin.from('ai_messages').insert({
    conversation_id: conversation.id, user_id: user.id, role: 'user', content: message
  });
  if (saveUserError) return NextResponse.json({ error: 'Could not save your message' }, { status: 500 });

  try {
    let reply: string;
    if (b.upload_id) {
      const { data: upload } = await admin.from('homework_uploads')
        .select('file_path,file_type,file_name').eq('id', b.upload_id).eq('user_id', user.id).single();
      if (!upload) return NextResponse.json({ error: 'The selected upload was not found.' }, { status: 404 });
      const { data: file, error: downloadError } = await admin.storage.from('homework-uploads').download(upload.file_path);
      if (downloadError || !file) return NextResponse.json({ error: 'Could not read the selected upload.' }, { status: 404 });
      if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'This file is larger than the supported 10MB limit.' }, { status: 413 });
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      const data = btoa(binary);
      reply = await aiHomework(messages, { mimeType: upload.file_type, data });
    } else {
      reply = await aiChat(messages);
    }
    const { error: saveReplyError } = await admin.from('ai_messages').insert({
      conversation_id: conversation.id, user_id: user.id, role: 'assistant', content: reply
    });
    if (saveReplyError) return NextResponse.json({ error: 'The AI responded, but the reply could not be saved.' }, { status: 500 });
    return NextResponse.json({ reply, conversation_id: conversation.id });
  } catch (e: any) {
    if (e.message === 'AI_NOT_CONFIGURED') return NextResponse.json({ error: 'AI provider is not configured yet. Set AI_PROVIDER and AI_API_KEY on the server.', code: 'AI_NOT_CONFIGURED' }, { status: 503 });
    if (e.message === 'AI_ATTACHMENT_UNSUPPORTED') return NextResponse.json({ error: 'Your current OpenAI model setup supports image homework uploads. For PDF homework, configure Gemini as the AI_PROVIDER.' }, { status: 422 });
    return NextResponse.json({ error: 'AI provider error. Please try again.' }, { status: 502 });
  }
}
