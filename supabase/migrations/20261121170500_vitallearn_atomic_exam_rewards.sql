-- Enforce one answer row per question per exam and award points atomically exactly once.
create unique index if not exists student_answers_session_question_uidx
  on public.student_answers(session_id, question_id)
  where session_id is not null;

create unique index if not exists points_transactions_exam_once_uidx
  on public.points_transactions(user_id, reason, reference_id)
  where reason = 'exam_submission' and reference_id is not null;

create or replace function public.award_exam_points(p_session_id uuid, p_points integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_user_id uuid;
begin
  if p_points < 0 or p_points > 10000 then
    raise exception 'Invalid points amount';
  end if;
  select user_id into v_user_id
  from public.practice_sessions
  where id = p_session_id and status = 'submitted';
  if v_user_id is null then
    raise exception 'Submitted exam session not found';
  end if;
  insert into public.points_transactions(user_id, points, reason, reference_id)
  values (v_user_id, p_points, 'exam_submission', p_session_id)
  on conflict (user_id, reason, reference_id)
    where reason = 'exam_submission' and reference_id is not null
  do nothing;
  if not found then
    return false;
  end if;
  update public.profiles set points = points + p_points where id = v_user_id;
  return true;
end;
$function$;

revoke all on function public.award_exam_points(uuid, integer) from public, anon, authenticated;
grant execute on function public.award_exam_points(uuid, integer) to service_role;
