-- Keep the SECURITY DEFINER admin predicate outside the exposed public API schema.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $function$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'teacher')
  );
$function$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;

do $block$
declare
  p record;
  stmt text;
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (coalesce(qual, '') like '%is_admin()%'
        or coalesce(with_check, '') like '%is_admin()%')
  loop
    stmt := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    if p.qual is not null then
      stmt := stmt || format(' using (%s)', replace(p.qual, 'is_admin()', 'private.is_admin()'));
    end if;
    if p.with_check is not null then
      stmt := stmt || format(' with check (%s)', replace(p.with_check, 'is_admin()', 'private.is_admin()'));
    end if;
    execute stmt;
  end loop;
end;
$block$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to service_role;
