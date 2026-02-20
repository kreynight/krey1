-- Migration 002: Fix profile auto-creation for phone and Google OAuth users
-- Run this in your Supabase SQL editor AFTER running 001_init.sql

-- The original trigger assumed every user has an email. Phone-only users
-- have a NULL email, which causes split_part() to return an empty string
-- and potentially break the username uniqueness constraint.
-- This replaces the trigger function to handle all three auth methods:
-- email/password, Google OAuth, and phone OTP.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  generated_username text;
  base_name          text;
  attempts           int := 0;
begin
  -- Derive a readable base from whatever identifier is available
  if NEW.email is not null and NEW.email <> '' then
    -- Email or Google OAuth: use the local part of the email
    base_name := regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g');
    if char_length(base_name) < 2 then
      base_name := 'user';
    end if;
  else
    -- Phone-only user
    base_name := 'user';
  end if;

  -- Attempt to claim a unique username (retry a few times on collision)
  loop
    generated_username := lower(base_name) || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);

    begin
      insert into public.profiles (id, username)
      values (NEW.id, generated_username);
      exit; -- success
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts >= 5 then
        -- Fallback: full UUID suffix
        generated_username := 'user_' || replace(gen_random_uuid()::text, '-', '');
        insert into public.profiles (id, username) values (NEW.id, generated_username);
        exit;
      end if;
    end;
  end loop;

  return NEW;
end;
$$;
