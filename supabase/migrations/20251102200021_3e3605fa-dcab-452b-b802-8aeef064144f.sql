-- Remove problematic foreign key constraints on followers table
-- These constraints reference auth.users which should not be directly referenced
-- RLS policies already secure access properly

ALTER TABLE public.followers 
DROP CONSTRAINT IF EXISTS followers_follower_id_fkey;

ALTER TABLE public.followers 
DROP CONSTRAINT IF EXISTS followers_following_id_fkey;