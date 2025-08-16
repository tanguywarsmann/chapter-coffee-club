-- Fix email exposure issue by creating a secure public profile view
-- and updating policies to properly restrict sensitive data access

-- First, create a security definer function that returns only safe public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile_safe(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.id, p.username, p.avatar_url, p.created_at
  FROM public.profiles p
  WHERE p.id = target_user_id
    AND p.username IS NOT NULL 
    AND p.username != '';
$$;

-- Drop the problematic public policy that exposes all profile data
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Create a more restrictive policy that only allows authenticated access
-- Public profile data should be accessed through the safe function above
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

-- Keep the policy for users to access their own complete profile
-- (This already exists from previous migration: "Users can read their own complete profile")

-- Create a view for public profile access that only exposes safe data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  avatar_url,
  created_at
FROM public.profiles
WHERE username IS NOT NULL AND username != '';

-- Grant public access to the safe view
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;