-- Security Enhancement: Improve data privacy by restricting user_badges and reading_progress access
-- Only allow viewing badges and reading progress based on follower relationships

-- Drop overly permissive policies for user_badges
DROP POLICY IF EXISTS "Users can view others badges for public profiles" ON public.user_badges;

-- Create restrictive policy for user_badges - only own badges and badges of followed users
CREATE POLICY "Users can view badges based on relationships"
ON public.user_badges
FOR SELECT
USING (
  -- Users can see their own badges
  auth.uid() = user_id
  OR
  -- Users can see badges of people they follow
  EXISTS (
    SELECT 1 FROM public.followers 
    WHERE follower_id = auth.uid() 
    AND following_id = user_badges.user_id
  )
);

-- Drop overly permissive policy for reading_progress
DROP POLICY IF EXISTS "Public can view active reading for profiles" ON public.reading_progress;

-- Create restrictive policy for reading_progress - only show to followers
CREATE POLICY "Users can view reading progress based on relationships"
ON public.reading_progress
FOR SELECT
USING (
  -- Users can see their own progress
  auth.uid() = user_id
  OR
  -- Users can see active reading progress of people they follow
  (
    status = 'in_progress'::reading_status 
    AND current_page > 0
    AND EXISTS (
      SELECT 1 FROM public.followers 
      WHERE follower_id = auth.uid() 
      AND following_id = reading_progress.user_id
    )
  )
);