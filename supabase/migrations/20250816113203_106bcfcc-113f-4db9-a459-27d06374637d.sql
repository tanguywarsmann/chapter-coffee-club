-- Create a function to get all public profiles for discover page
CREATE OR REPLACE FUNCTION public.get_all_public_profiles(profile_limit integer DEFAULT 55)
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
  WHERE p.username IS NOT NULL 
    AND p.username != ''
  ORDER BY p.created_at DESC
  LIMIT profile_limit;
$$;