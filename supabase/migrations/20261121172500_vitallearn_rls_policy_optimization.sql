-- Remove SELECT overlap between public-read and admin-write policies.
do $block$
declare
  t text;
begin
  foreach t in array array['education_levels','examination_types','lessons','question_options','questions','subjects','topics'] loop
    execute format('drop policy if exists %I on public.%I', 'admin write', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (private.is_admin())', 'admin insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (private.is_admin()) with check (private.is_admin())', 'admin update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (private.is_admin())', 'admin delete', t);
  end loop;
end;
$block$;

-- Cache auth.uid() once per statement rather than re-evaluating it per row.
do $block$
declare
  p record;
  stmt text;
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (coalesce(qual, '') like '%auth.uid()%'
        or coalesce(with_check, '') like '%auth.uid()%')
  loop
    stmt := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    if p.qual is not null then
      stmt := stmt || format(' using (%s)', replace(p.qual, 'auth.uid()', '(select auth.uid())'));
    end if;
    if p.with_check is not null then
      stmt := stmt || format(' with check (%s)', replace(p.with_check, 'auth.uid()', '(select auth.uid())'));
    end if;
    execute stmt;
  end loop;
end;
$block$;
