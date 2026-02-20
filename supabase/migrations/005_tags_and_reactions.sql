-- ─── Post metadata tags ──────────────────────────────────────────────────
alter table public.posts
  add column source_type text
    check (source_type in ('first_hand','observation','research','hypothetical')),
  add column confidence_level text
    check (confidence_level in ('exploring','somewhat_confident','strong_conviction','open_to_change')),
  add column debate_intent text
    check (debate_intent in ('open_to_debate','neutral','seeking_opposition','not_debating'));

create index idx_posts_source_type      on public.posts (source_type);
create index idx_posts_confidence_level on public.posts (confidence_level);
create index idx_posts_debate_intent    on public.posts (debate_intent);

-- ─── Reaction count columns on posts ────────────────────────────────────
alter table public.posts
  add column agree_count              int not null default 0,
  add column thought_provoking_count  int not null default 0,
  add column appreciate_count         int not null default 0,
  add column curious_count            int not null default 0;

-- ─── Reactions table ─────────────────────────────────────────────────────
create table public.reactions (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.posts(id) on delete cascade,
  session_id    text not null,
  reaction_type text not null
    check (reaction_type in ('agree','thought_provoking','appreciate','curious')),
  created_at    timestamptz default now(),
  unique (post_id, session_id)
);

alter table public.reactions enable row level security;

create policy "Reactions viewable by everyone" on public.reactions for select using (true);
create policy "Anyone can react"               on public.reactions for insert with check (true);
create policy "Anyone can update reaction"     on public.reactions for update using (true);
create policy "Anyone can delete reaction"     on public.reactions for delete using (true);

-- ─── Trigger: keep reaction counts in sync ───────────────────────────────
create or replace function public.update_reaction_counts()
returns trigger language plpgsql as $$
begin
  -- decrement old type
  if TG_OP in ('DELETE','UPDATE') then
    if    OLD.reaction_type = 'agree'             then update public.posts set agree_count             = greatest(0, agree_count             - 1) where id = OLD.post_id;
    elsif OLD.reaction_type = 'thought_provoking' then update public.posts set thought_provoking_count = greatest(0, thought_provoking_count - 1) where id = OLD.post_id;
    elsif OLD.reaction_type = 'appreciate'        then update public.posts set appreciate_count        = greatest(0, appreciate_count        - 1) where id = OLD.post_id;
    elsif OLD.reaction_type = 'curious'           then update public.posts set curious_count           = greatest(0, curious_count           - 1) where id = OLD.post_id;
    end if;
  end if;
  -- increment new type
  if TG_OP in ('INSERT','UPDATE') then
    if    NEW.reaction_type = 'agree'             then update public.posts set agree_count             = agree_count             + 1 where id = NEW.post_id;
    elsif NEW.reaction_type = 'thought_provoking' then update public.posts set thought_provoking_count = thought_provoking_count + 1 where id = NEW.post_id;
    elsif NEW.reaction_type = 'appreciate'        then update public.posts set appreciate_count        = appreciate_count        + 1 where id = NEW.post_id;
    elsif NEW.reaction_type = 'curious'           then update public.posts set curious_count           = curious_count           + 1 where id = NEW.post_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger reaction_counts_trigger
after insert or update or delete on public.reactions
for each row execute function public.update_reaction_counts();
