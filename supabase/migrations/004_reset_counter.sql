-- !! DANGER — ONE-TIME DEV SCRIPT. DO NOT RUN IN PRODUCTION. !!
-- Deletes ALL posts, comments, and likes, then resets the post counter.
-- This was used once to wipe test data before launch. Never run again.

-- delete from public.comments;
-- delete from public.likes;
-- delete from public.posts;
-- update public.post_counter set current_number = 100000 where id = 1;
