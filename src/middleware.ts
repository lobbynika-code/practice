import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
const PROTECTED = ['/dashboard','/learn','/practice','/results','/trending','/questions','/ai-tutor','/homework','/analytics','/leaderboard','/community','/profile','/settings','/admin','/onboarding'];
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: (cookiesToSet: { name: string; value: string; options: any }[]) => cookiesToSet.forEach(({ name, value, options }) => { request.cookies.set(name, value); response.cookies.set(name, value, options); }) },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (PROTECTED.some(p => path === p || path.startsWith(p + '/')) && !user) {
    const url = request.nextUrl.clone(); url.pathname = '/login'; url.searchParams.set('next', path); return NextResponse.redirect(url);
  }
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'] };
