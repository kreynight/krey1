-- Remove auth requirements; add optional signature for anonymous posts/comments

-- ─── posts: drop FK on author_id, make nullable, add signature ───────────
alter table public.posts drop constraint if exists posts_author_id_fkey;
alter table public.posts alter column author_id drop not null;
alter table public.posts add column if not exists signature text;

-- ─── comments: drop FK on author_id, make nullable, add signature ─────────
alter table public.comments drop constraint if exists comments_author_id_fkey;
alter table public.comments alter column author_id drop not null;
alter table public.comments add column if not exists signature text;

-- ─── RLS: open posts + comments to anonymous writes ───────────────────────
drop policy if exists "Authenticated users can create posts" on public.posts;
create policy "Anyone can create posts"
  on public.posts for insert with check (true);

drop policy if exists "Authenticated users can comment" on public.comments;
create policy "Anyone can create comments"
  on public.comments for insert with check (true);

-- ─── Like/unlike RPCs (SECURITY DEFINER → bypasses RLS) ──────────────────
create or replace function public.like_post(post_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.posts set likes_count = likes_count + 1 where id = post_id;
end;
$$;

create or replace function public.unlike_post(post_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.posts set likes_count = greatest(0, likes_count - 1) where id = post_id;
end;
$$;
