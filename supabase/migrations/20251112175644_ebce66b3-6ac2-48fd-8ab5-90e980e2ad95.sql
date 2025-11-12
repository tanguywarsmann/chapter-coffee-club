-- Migration: Drop and recreate cleanup_user_data with correct return type
-- Fixes account deletion by using actual schema column names

DROP FUNCTION IF EXISTS public.cleanup_user_data(uuid);

CREATE OR REPLACE FUNCTION public.cleanup_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_deleted_count integer;
  v_total_deleted integer := 0;
BEGIN
  RAISE NOTICE 'Starting cleanup for user: %', target_user_id;

  -- 1. Delete user's reading validations
  DELETE FROM reading_validations WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % reading_validations', v_deleted_count;

  -- 2. Delete user's reading progress
  DELETE FROM reading_progress WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % reading_progress', v_deleted_count;

  -- 3. Delete user's badges
  DELETE FROM user_badges WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % user_badges', v_deleted_count;

  -- 4. Delete user's favorite badges
  DELETE FROM user_favorite_badges WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % user_favorite_badges', v_deleted_count;

  -- 5. Delete user's favorite books
  DELETE FROM user_favorite_books WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % user_favorite_books', v_deleted_count;

  -- 6. Delete user's levels
  DELETE FROM user_levels WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % user_levels', v_deleted_count;

  -- 7. Delete user's monthly rewards
  DELETE FROM user_monthly_rewards WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % user_monthly_rewards', v_deleted_count;

  -- 8. Delete user's quests
  DELETE FROM user_quests WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % user_quests', v_deleted_count;

  -- 9. Delete user's book chats
  DELETE FROM book_chats WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % book_chats', v_deleted_count;

  -- 10. Delete user's book requests
  DELETE FROM book_requests WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % book_requests', v_deleted_count;

  -- 11. Delete user's feedback submissions
  DELETE FROM feedback_submissions WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % feedback_submissions', v_deleted_count;

  -- 12. Delete user's feedback comments
  DELETE FROM feedback_comments WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % feedback_comments', v_deleted_count;

  -- 13. Delete user's feedback votes
  DELETE FROM feedback_votes WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % feedback_votes', v_deleted_count;

  -- 14. Delete user's quick ratings
  DELETE FROM feedback_quick_ratings WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % feedback_quick_ratings', v_deleted_count;

  -- 15. Delete user's feedback points
  DELETE FROM user_feedback_points WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % user_feedback_points', v_deleted_count;

  -- 16. Delete user's settings
  DELETE FROM user_settings WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % user_settings', v_deleted_count;

  -- 17. Delete user's IAP receipts
  DELETE FROM apple_iap_receipts WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % apple_iap_receipts', v_deleted_count;

  -- 18. Delete user's book completion awards
  DELETE FROM book_completion_awards WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % book_completion_awards', v_deleted_count;

  -- 19. Delete follower relationships (uses follower_id + following_id)
  DELETE FROM followers WHERE follower_id = target_user_id OR following_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % followers', v_deleted_count;

  -- 20. Delete user's notifications (uses recipient_id + actor_id)
  DELETE FROM notifications WHERE recipient_id = target_user_id OR actor_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % notifications', v_deleted_count;

  -- 21. Delete user's activity likes (uses liker_id)
  DELETE FROM activity_likes WHERE liker_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % activity_likes', v_deleted_count;

  -- 22. Delete user's feed bookys (uses liker_id)
  DELETE FROM feed_bookys WHERE liker_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % feed_bookys', v_deleted_count;

  -- 23. Delete user's feed events (uses actor_id)
  DELETE FROM feed_events WHERE actor_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % feed_events', v_deleted_count;

  -- 24. FINALLY: Delete the profile (uses 'id' not 'user_id')
  DELETE FROM profiles WHERE id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  v_total_deleted := v_total_deleted + v_deleted_count;
  RAISE NOTICE 'Deleted % profiles', v_deleted_count;

  RAISE NOTICE 'Total rows deleted: %', v_total_deleted;

  -- Return success with details
  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'total_deleted', v_total_deleted,
    'message', 'User data successfully cleaned up'
  );

EXCEPTION WHEN OTHERS THEN
  DECLARE
    v_error_msg text;
    v_error_detail text;
    v_error_hint text;
  BEGIN
    GET STACKED DIAGNOSTICS
      v_error_msg = MESSAGE_TEXT,
      v_error_detail = PG_EXCEPTION_DETAIL,
      v_error_hint = PG_EXCEPTION_HINT;
    
    RAISE WARNING 'Error during cleanup: % | Detail: % | Hint: %', v_error_msg, v_error_detail, v_error_hint;
    
    RETURN json_build_object(
      'success', false,
      'error', v_error_msg,
      'detail', v_error_detail,
      'hint', v_error_hint,
      'user_id', target_user_id
    );
  END;
END;
$$;