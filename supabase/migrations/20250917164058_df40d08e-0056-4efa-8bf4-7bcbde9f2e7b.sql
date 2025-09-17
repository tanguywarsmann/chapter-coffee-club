-- Fix the notify_followers_on_completion trigger to handle null status values properly
CREATE OR REPLACE FUNCTION public.notify_followers_on_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare 
  b_title text;
begin
  if new.status = 'completed' and (old.status IS NULL OR old.status != 'completed') then
    select title into b_title from public.books where id = new.book_id;
    
    insert into public.notifications(recipient_id, actor_id, type, progress_id, book_id, book_title)
    select f.follower_id, new.user_id, 'friend_finished', new.id, new.book_id, b_title
    from public.followers f
    where f.following_id = new.user_id and f.follower_id <> new.user_id;
  end if;
  
  return new;
end $function$;