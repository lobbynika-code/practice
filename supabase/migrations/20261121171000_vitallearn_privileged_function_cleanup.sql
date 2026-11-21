revoke all on function public.handle_new_user() from public, anon, authenticated;
create or replace function public.bump_counter()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if tg_op = 'INSERT' then
    update public.questions set saves = saves + 1 where id = new.question_id;
  elsif tg_op = 'DELETE' then
    update public.questions set saves = greatest(saves - 1, 0) where id = old.question_id;
  end if;
  return coalesce(new, old);
end;
$function$;
revoke insert, delete on public.profiles from anon, authenticated;
revoke insert, update, delete on public.practice_sessions from anon, authenticated;
revoke insert, update, delete on public.points_transactions from anon, authenticated;
