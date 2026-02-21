-- ─── Active sessions (live user tracking) ────────────────────────────────────
-- One row per browser session. last_seen is updated every ~60 s by the client.
-- The table itself is not directly accessible — all reads/writes go through the
-- security-definer function below so the anon key cannot abuse it.

create table public.active_sessions (
  session_id  text        primary key,
  last_seen   timestamptz not null default now()
);

alter table public.active_sessions enable row level security;
-- No RLS policies needed — the security-definer function bypasses RLS.

-- ─── ping_active_session ─────────────────────────────────────────────────────
-- Called by the client every 60 s.
-- 1. Upserts the caller's session (one row per browser, ever).
-- 2. Returns the count of sessions seen in the last 2 hours.
-- Security definer so the anon key can call it without direct table access.
create or replace function public.ping_active_session(p_session_id text)
returns int
language plpgsql
security definer
as $$
declare
  active_count int;
begin
  insert into public.active_sessions (session_id, last_seen)
  values (p_session_id, now())
  on conflict (session_id) do update set last_seen = now();

  select count(*)::int into active_count
  from public.active_sessions
  where last_seen > now() - interval '2 hours';

  return active_count;
end;
$$;
