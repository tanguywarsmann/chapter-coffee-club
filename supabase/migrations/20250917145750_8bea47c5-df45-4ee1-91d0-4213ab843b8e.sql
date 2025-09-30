-- Disable problematic trigger temporarily
DROP TRIGGER IF EXISTS trigger_notify_followers_on_completion ON reading_progress;

-- Check what reading_status enum values are valid
DO $$
BEGIN
    RAISE NOTICE 'Reading status enum values: %', (
        SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
        FROM pg_enum 
        WHERE enumtypid = 'reading_status'::regtype
    );
END $$;

-- Fix the trigger function to handle empty/null old status
CREATE OR REPLACE FUNCTION public.notify_followers_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare 
  b_title text;
begin
  -- Only process if status changed to completed
  if NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') then
    select title into b_title from public.books where id = NEW.book_id;
    
    insert into public.notifications(recipient_id, actor_id, type, progress_id, book_id, book_title)
    select f.follower_id, NEW.user_id, 'friend_finished', NEW.id, NEW.book_id, b_title
    from public.followers f
    where f.following_id = NEW.user_id and f.follower_id <> NEW.user_id;
  end if;
  
  return NEW;
end;
$$;

-- Re-enable the trigger
CREATE TRIGGER trigger_notify_followers_on_completion
  AFTER UPDATE ON reading_progress
  FOR EACH ROW EXECUTE FUNCTION public.notify_followers_on_completion();

-- Now test the function
SELECT force_validate_segment_beta(
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
  'test',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  false, 
  true
);