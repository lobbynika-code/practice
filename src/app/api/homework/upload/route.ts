import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX = 10 * 1024 * 1024;
export async function POST(req: NextRequest) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Only PDF, PNG and JPG files are supported.' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: 'File exceeds 10MB limit.' }, { status: 400 });
  const admin = createAdminClient();
  const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { error } = await admin.storage.from('homework-uploads').upload(path, file, { contentType: file.type });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data } = await admin.from('homework_uploads').insert({ user_id: user.id, file_name: file.name, file_path: path, file_type: file.type, file_size: file.size, status: 'uploaded' }).select().single();
  return NextResponse.json({ upload: data, message: 'File uploaded securely. Ask a question about it in the Homework Assistant.' });
}
export async function DELETE(req: NextRequest) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id'); if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const admin = createAdminClient();
  const { data: row } = await admin.from('homework_uploads').select('file_path').eq('id', id).eq('user_id', user.id).single();
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await admin.storage.from('homework-uploads').remove([row.file_path]);
  await admin.from('homework_uploads').delete().eq('id', id);
  return NextResponse.json({ ok: true });
}
