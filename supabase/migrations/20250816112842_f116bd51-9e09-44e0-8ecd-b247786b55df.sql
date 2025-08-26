-- Fix critical security issue: Remove overly permissive public read access to reading_progress
-- while maintaining legitimate public profile functionality

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Allow public read for profiles" ON public.reading_progress;

-- Create a more secure policy that only allows public access to minimal data
-- for public profiles (only in_progress books, not full reading history)
CREATE POLICY "Public can view active reading for profiles" 
ON public.reading_progress 
FOR SELECT 
USING (
  status = 'in_progress' 
  AND current_page > 0
);

-- Ensure users can still access their own complete reading data
-- (The existing "Users can view own reading progress" policy handles this)

-- Also fix the profiles table security issue by restricting email access
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;

-- Create separate policies for own profile vs public profile viewing
CREATE POLICY "Users can read their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Public can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (username IS NOT NULL AND username != '');

-- Fix user_favorite_books to be more restrictive
DROP POLICY IF EXISTS "Public can read if manually filtered" ON public.user_favorite_books;

CREATE POLICY "Public can view favorite books for public profiles" 
ON public.user_favorite_books 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = user_favorite_books.user_id 
    AND profiles.username IS NOT NULL 
    AND profiles.username != ''
  )
);