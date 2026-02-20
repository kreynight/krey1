-- Wipe all test data and reset post counter to 100,000

delete from public.comments;
delete from public.likes;
delete from public.posts;
update public.post_counter set current_number = 100000 where id = 1;
