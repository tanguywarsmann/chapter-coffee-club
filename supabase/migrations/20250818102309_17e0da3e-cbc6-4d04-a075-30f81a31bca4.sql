-- Edge Function for secure account deletion
-- This will be handled in the edge function code, not in the database migration
-- Creating any necessary cleanup functions if needed

-- Function to help with data cleanup (can be called from edge function)
CREATE OR REPLACE FUNCTION public.cleanup_user_data(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Delete user's reading validations
  DELETE FROM reading_validations WHERE user_id = target_user_id;
  
  -- Delete user's reading progress
  DELETE FROM reading_progress WHERE user_id = target_user_id;
  
  -- Delete user's badges
  DELETE FROM user_badges WHERE user_id = target_user_id;
  
  -- Delete user's favorite badges
  DELETE FROM user_favorite_badges WHERE user_id = target_user_id;
  
  -- Delete user's favorite books
  DELETE FROM user_favorite_books WHERE user_id = target_user_id;
  
  -- Delete user's levels
  DELETE FROM user_levels WHERE user_id = target_user_id;
  
  -- Delete user's monthly rewards
  DELETE FROM user_monthly_rewards WHERE user_id = target_user_id;
  
  -- Delete user's quests
  DELETE FROM user_quests WHERE user_id = target_user_id;
  
  -- Delete user's locks
  DELETE FROM validation_locks WHERE user_id = target_user_id;
  
  -- Delete follower relationships
  DELETE FROM followers WHERE follower_id = target_user_id OR following_id = target_user_id;
  
  -- Delete user's book chats
  DELETE FROM book_chats WHERE user_id = target_user_id;
  
  -- Finally delete the profile
  DELETE FROM profiles WHERE id = target_user_id;
END;
$$;