-- Migration: Improved cleanup_user_data function with better error handling
-- This replaces the previous version with:
-- 1. JSON return type for better error reporting
-- 2. Robust exception handling for missing tables
-- 3. Detailed logging of each deletion step
-- 4. Support for additional tables (posts, comments, likes)

CREATE OR REPLACE FUNCTION public.cleanup_user_data(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_deleted_count integer := 0;
  v_error_msg text;
BEGIN
  -- Use a transaction to ensure atomicity
  -- Log the start
  RAISE NOTICE 'Starting cleanup for user: %', target_user_id;

  -- Delete user's reading validations
  DELETE FROM reading_validations WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % reading_validations', v_deleted_count;

  -- Delete user's reading progress
  DELETE FROM reading_progress WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % reading_progress', v_deleted_count;

  -- Delete user's badges
  DELETE FROM user_badges WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % user_badges', v_deleted_count;

  -- Delete user's favorite badges (check if table exists)
  BEGIN
    DELETE FROM user_favorite_badges WHERE user_id = target_user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user_favorite_badges', v_deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table user_favorite_badges does not exist, skipping';
  END;

  -- Delete user's favorite books (check if table exists)
  BEGIN
    DELETE FROM user_favorite_books WHERE user_id = target_user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user_favorite_books', v_deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table user_favorite_books does not exist, skipping';
  END;

  -- Delete user's levels (check if table exists)
  BEGIN
    DELETE FROM user_levels WHERE user_id = target_user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user_levels', v_deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table user_levels does not exist, skipping';
  END;

  -- Delete user's monthly rewards (check if table exists)
  BEGIN
    DELETE FROM user_monthly_rewards WHERE user_id = target_user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user_monthly_rewards', v_deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table user_monthly_rewards does not exist, skipping';
  END;

  -- Delete user's quests (check if table exists)
  BEGIN
    DELETE FROM user_quests WHERE user_id = target_user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user_quests', v_deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table user_quests does not exist, skipping';
  END;

  -- Delete user's locks (check if table exists)
  BEGIN
    DELETE FROM validation_locks WHERE user_id = target_user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % validation_locks', v_deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table validation_locks does not exist, skipping';
  END;

  -- Delete follower relationships
  DELETE FROM followers WHERE follower_id = target_user_id OR following_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % followers', v_deleted_count;

  -- Delete user's book chats
  DELETE FROM book_chats WHERE user_id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % book_chats', v_deleted_count;

  -- Delete user's posts (social feature)
  BEGIN
    DELETE FROM posts WHERE user_id = target_user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % posts', v_deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table posts does not exist, skipping';
  END;

  -- Delete user's comments
  BEGIN
    DELETE FROM comments WHERE user_id = target_user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % comments', v_deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table comments does not exist, skipping';
  END;

  -- Delete user's likes
  BEGIN
    DELETE FROM likes WHERE user_id = target_user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % likes', v_deleted_count;
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table likes does not exist, skipping';
  END;

  -- Finally delete the profile
  DELETE FROM profiles WHERE id = target_user_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % profiles', v_deleted_count;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'message', 'User data successfully cleaned up'
  );

EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS v_error_msg = MESSAGE_TEXT;
  RAISE WARNING 'Error during cleanup: %', v_error_msg;
  -- Return error details
  RETURN json_build_object(
    'success', false,
    'error', v_error_msg,
    'user_id', target_user_id
  );
END;
$$;
