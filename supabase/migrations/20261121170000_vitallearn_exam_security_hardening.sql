-- VitalLearn hardening: trusted scoring, protected answer keys, and least-privilege student writes.
-- Exam sessions are created and finalized only by authenticated server routes using the service role.
drop policy if exists "own sessions" on public.practice_sessions;
create policy "students read own sessions" on public.practice_sessions
  for select to authenticated using ((select auth.uid()) = user_id);

-- Students may save only their own answer selections while their session is in progress.
drop policy if exists "own answers" on public.student_answers;
create policy "students read own answers" on public.student_answers
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "students insert own in-progress answers" on public.student_answers
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.practice_sessions s
      where s.id = session_id and s.user_id = (select auth.uid()) and s.status = 'in_progress'
    )
  );
create policy "students update own in-progress answers" on public.student_answers
  for update to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.practice_sessions s
      where s.id = session_id and s.user_id = (select auth.uid()) and s.status = 'in_progress'
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.practice_sessions s
      where s.id = session_id and s.user_id = (select auth.uid()) and s.status = 'in_progress'
    )
  );

-- Column grants prevent students from supplying grades or changing points/roles.
revoke insert, update, delete on public.practice_sessions from anon, authenticated;
grant select on public.practice_sessions to authenticated;

revoke insert, update, delete on public.student_answers from anon, authenticated;
grant select on public.student_answers to authenticated;
grant insert (session_id, question_id, user_id, selected_option_id, selected_text, marked_for_review)
  on public.student_answers to authenticated;
grant update (selected_option_id, selected_text, marked_for_review)
  on public.student_answers to authenticated;

revoke update on public.profiles from anon, authenticated;
grant update (full_name, avatar_url, country, education_level_id, school, exam_system, is_public, onboarding_done)
  on public.profiles to authenticated;

-- Answer keys are server-only; the client receives options, never the answer key.
revoke all on public.question_answers from anon, authenticated;
alter table public.question_answers enable row level security;

-- These SECURITY DEFINER functions must never be callable as public RPCs.
revoke all on function public.add_points(uuid, integer) from public, anon, authenticated;
grant execute on function public.add_points(uuid, integer) to service_role;
revoke all on function public.increment_attempts(uuid) from public, anon, authenticated;
grant execute on function public.increment_attempts(uuid) to service_role;

-- Keep the helper available for RLS policy evaluation. It returns only the caller's own role predicate.
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- No client can directly mint or alter point ledger entries.
revoke insert, update, delete on public.points_transactions from anon, authenticated;
grant select on public.points_transactions to authenticated;
