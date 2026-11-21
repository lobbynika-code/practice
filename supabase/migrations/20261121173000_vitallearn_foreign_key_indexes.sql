do $block$
declare
  f record;
  index_name text;
  column_list text;
begin
  for f in
    select c.conrelid,
      c.conname,
      c.conkey,
      n.nspname as schema_name,
      t.relname as table_name,
      string_agg(format('%I', a.attname), ', ' order by u.ord) as column_list,
      string_agg(a.attname, '_' order by u.ord) as column_slug
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    cross join lateral unnest(c.conkey) with ordinality u(attnum, ord)
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = u.attnum
    where c.contype = 'f' and n.nspname = 'public'
    group by c.conrelid, c.conname, c.conkey, n.nspname, t.relname
  loop
    if not exists (
      select 1
      from pg_index i
      cross join lateral unnest(i.indkey::smallint[]) with ordinality k(attnum, ord)
      where i.indrelid = f.conrelid and i.indisvalid and i.indisready
        and k.ord = 1 and k.attnum = f.conkey[1]
        and (
          cardinality(f.conkey) = 1
          or (
            select array_agg(k2.attnum order by k2.ord)
            from unnest(i.indkey::smallint[]) with ordinality k2(attnum, ord)
            where k2.ord <= cardinality(f.conkey)
          ) = f.conkey
        )
    ) then
      index_name := left('idx_fk_' || f.table_name || '_' || f.column_slug, 60);
      execute format('create index if not exists %I on %I.%I (%s)',
        index_name, f.schema_name, f.table_name, f.column_list);
    end if;
  end loop;
end;
$block$;
