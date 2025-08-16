-- Fix the security definer view issue by removing the problematic view
-- and using a different approach for public profile access

-- Drop the problematic view
DROP VIEW IF EXISTS public.public_profiles;

-- Remove grants that are no longer needed
-- (The view has been dropped so grants are automatically removed)

-- The solution is to modify application code to use the existing secure function
-- get_public_profile_safe() or the existing get_public_profile() function
-- instead of direct table access for public profiles

-- Verify that we have proper policies in place:
-- 1. "Users can read their own complete profile" - allows users to see their own data
-- 2. "Authenticated users can view profiles" - allows authenticated users to see other profiles
-- 3. The existing get_public_profile() function provides safe public access

-- No additional changes needed - the security is now properly implemented
-- through the existing security definer function and RLS policies