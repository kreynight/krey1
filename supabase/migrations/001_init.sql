-- Philosophy Of. — Database Schema
-- Run this in your Supabase SQL editor

-- ─── Profiles ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  bio         text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- ─── Post counter (single row, decrements from 100000) ────────────────────
create table if not exists public.post_counter (
  id              int primary key default 1,
  current_number  int not null default 100000,
  constraint single_row check (id = 1)
);

-- Seed it
insert into public.post_counter (id, current_number)
values (1, 100000)
on conflict (id) do nothing;

alter table public.post_counter enable row level security;

create policy "Counter is viewable by everyone"
  on public.post_counter for select using (true);

-- ─── Posts ────────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  post_number     int unique not null,
  author_id       uuid not null references public.profiles(id) on delete cascade,
  topic           text not null,
  title           text not null,
  body            text not null,
  likes_count     int not null default 0,
  comments_count  int not null default 0,
  created_at      timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert with check (auth.uid() = author_id);

-- ─── Likes ───────────────────────────────────────────────────────────────
create table if not exists public.likes (
  id        uuid primary key default gen_random_uuid(),
  post_id   uuid not null references public.posts(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

create policy "Authenticated users can like"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike their own likes"
  on public.likes for delete using (auth.uid() = user_id);

-- ─── Comments ────────────────────────────────────────────────────────────
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  created_at  timestamptz default now()
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Authenticated users can comment"
  on public.comments for insert with check (auth.uid() = author_id);

-- ─── Atomic post-number function ─────────────────────────────────────────
-- Called server-side to claim the next post number atomically.
create or replace function public.claim_post_number()
returns int
language plpgsql
security definer
as $$
declare
  claimed int;
begin
  select current_number into claimed
  from public.post_counter
  where id = 1
  for update;   -- row lock prevents races

  if claimed <= 0 then
    raise exception 'No post numbers remaining. The count has reached zero.';
  end if;

  update public.post_counter
  set current_number = current_number - 1
  where id = 1;

  return claimed;
end;
$$;

-- ─── Trigger: keep likes_count in sync ───────────────────────────────────
create or replace function public.update_likes_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set likes_count = likes_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$;

create trigger likes_count_trigger
after insert or delete on public.likes
for each row execute function public.update_likes_count();

-- ─── Trigger: keep comments_count in sync ────────────────────────────────
create or replace function public.update_comments_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set comments_count = comments_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$;

create trigger comments_count_trigger
after insert or delete on public.comments
for each row execute function public.update_comments_count();

-- ─── Trigger: auto-create profile on signup ──────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  generated_username text;
begin
  -- Generate a unique username from email prefix + random suffix
  generated_username := split_part(NEW.email, '@', 1) || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 5);

  insert into public.profiles (id, username)
  values (NEW.id, generated_username)
  on conflict (id) do nothing;

  return NEW;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
