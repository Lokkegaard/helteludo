-- Helteludo: spilserver i Supabase (projektet »Skolearbejde«).
-- Spillets online-kode bruger en lille dokument-database: doc(sti).get/set/delete/acquire/onSnapshot.
-- Her ligger hvert dokument som én række. Alle må læse (spillene er offentlige), men der skrives kun
-- gennem funktionerne nedenfor, som kun accepterer stier under games/ og begrænser størrelsen.
-- Kør igen uden problemer: alt er "if not exists" / "or replace".

create table if not exists public.helteludo_docs (
  path        text primary key check (path ~ '^games/[A-Z0-9]{5}(/seen/[A-Za-z0-9_-]{1,40})?$'),
  parent      text not null,
  data        jsonb,
  lock_holder text,
  lock_until  timestamptz,
  updated_at  timestamptz not null default now()
);
create index if not exists helteludo_docs_parent on public.helteludo_docs (parent);

alter table public.helteludo_docs enable row level security;
drop policy if exists "helteludo laes" on public.helteludo_docs;
create policy "helteludo laes" on public.helteludo_docs for select to anon, authenticated using (true);
revoke insert, update, delete on public.helteludo_docs from anon, authenticated;

-- Live-opdateringer (Realtime) for tabellen.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='helteludo_docs') then
    alter publication supabase_realtime add table public.helteludo_docs;
  end if;
end $$;

-- Skriv et dokument (og frigiv en eventuel lås). Rydder samtidig gamle spil (over 2 døgn) op.
create or replace function public.helteludo_set(p_path text, p_data jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_path !~ '^games/[A-Z0-9]{5}(/seen/[A-Za-z0-9_-]{1,40})?$' then raise exception 'ugyldig sti'; end if;
  if octet_length(p_data::text) > 400000 then raise exception 'for stort dokument'; end if;
  insert into helteludo_docs (path, parent, data, lock_holder, lock_until, updated_at)
    values (p_path, regexp_replace(p_path, '/[^/]*$', ''), p_data, null, null, now())
    on conflict (path) do update set data = excluded.data, lock_holder = null, lock_until = null, updated_at = now();
  if random() < 0.02 then delete from helteludo_docs where updated_at < now() - interval '2 days'; end if;
end $$;

-- Slet et dokument og alt under det (fx et spil og dets "seen"-dokumenter).
create or replace function public.helteludo_delete(p_path text)
returns void language sql security definer set search_path = public as $$
  delete from helteludo_docs where path = p_path or path like p_path || '/%';
$$;

-- Lås et dokument i kort tid (som claude.ai's acquire): lykkes, hvis ingen anden holder en gyldig lås.
create or replace function public.helteludo_acquire(p_path text, p_holder text, p_ttl_ms int)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if p_path !~ '^games/[A-Z0-9]{5}(/seen/[A-Za-z0-9_-]{1,40})?$' then raise exception 'ugyldig sti'; end if;
  insert into helteludo_docs (path, parent, data, lock_holder, lock_until)
    values (p_path, regexp_replace(p_path, '/[^/]*$', ''), null, p_holder, now() + make_interval(secs => least(p_ttl_ms, 15000) / 1000.0))
    on conflict (path) do update set lock_holder = excluded.lock_holder, lock_until = excluded.lock_until
    where helteludo_docs.lock_until is null or helteludo_docs.lock_until < now() or helteludo_docs.lock_holder = p_holder;
  get diagnostics n = row_count;
  return n > 0;
end $$;

-- Frigiv en lås, når der alligevel ikke skrives noget. En række, der kun var en lås (intet dokument), slettes.
create or replace function public.helteludo_release(p_path text, p_holder text)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from helteludo_docs where path = p_path and data is null and lock_holder = p_holder;
  update helteludo_docs set lock_holder = null, lock_until = null where path = p_path and lock_holder = p_holder;
end $$;

revoke all on function public.helteludo_set(text, jsonb) from public;
revoke all on function public.helteludo_delete(text) from public;
revoke all on function public.helteludo_acquire(text, text, int) from public;
revoke all on function public.helteludo_release(text, text) from public;
grant execute on function public.helteludo_set(text, jsonb) to anon, authenticated;
grant execute on function public.helteludo_delete(text) to anon, authenticated;
grant execute on function public.helteludo_acquire(text, text, int) to anon, authenticated;
grant execute on function public.helteludo_release(text, text) to anon, authenticated;
