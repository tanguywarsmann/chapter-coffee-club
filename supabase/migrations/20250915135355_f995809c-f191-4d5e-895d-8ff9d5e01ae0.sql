-- Fix critical email exposure vulnerability in profiles table
-- The current RLS policies allow email addresses to be exposed to other users
-- because RLS works at row level, not column level

-- Drop the problematic policies that create security vulnerabilities
DROP POLICY IF EXISTS "Email only visible to profile owner" ON public.profiles;
DROP POLICY IF EXISTS "Public can view safe profile data only" ON public.profiles;

-- Create a secure view for public profile data that explicitly excludes email
CREATE VIEW public.profiles_public
WITH (security_invoker=true)
AS SELECT 
    id,
    username,
    avatar_url,
    created_at,
    updated_at,
    -- Explicitly exclude email, is_admin, onboarding fields
    NULL::text as email,
    NULL::boolean as is_admin
FROM public.profiles
WHERE username IS NOT NULL 
    AND username != ''
    AND id IS NOT NULL;

-- Create a secure RLS policy for public profile viewing
-- This ensures users can only see basic profile info of others, never emails
CREATE POLICY "Users can view public profiles safely" ON public.profiles
FOR SELECT 
USING (
    -- Users can see their own complete profile
    auth.uid() = id
    OR
    -- OR others can see profiles but only through controlled access
    -- (we'll handle this through the public view and specific queries)
    false
);

-- Create a security definer function for safe public profile access
-- This function ensures email is never exposed even if called incorrectly
CREATE OR REPLACE FUNCTION public.get_safe_public_profiles(limit_count integer DEFAULT 50)
RETURNS TABLE(
    id uuid,
    username text,
    avatar_url text,
    created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT p.id, p.username, p.avatar_url, p.created_at
    FROM public.profiles p
    WHERE p.username IS NOT NULL 
        AND p.username != ''
    ORDER BY p.created_at DESC
    LIMIT limit_count;
$$;

-- Update the existing get_public_profile function to be more secure
-- Ensure it never returns email or admin status
CREATE OR REPLACE FUNCTION public.get_public_profile(target_id uuid)
RETURNS TABLE(id uuid, username text, avatar_url text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return safe public fields, never email or admin status
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.id = target_id
    AND p.username IS NOT NULL 
    AND p.username != '';
$$;