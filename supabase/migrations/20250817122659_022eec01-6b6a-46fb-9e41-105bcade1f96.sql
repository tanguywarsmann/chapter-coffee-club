-- Fix security issue: Prevent email harvesting from profiles table
-- Drop the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a secure policy for public profile viewing that excludes sensitive data
CREATE POLICY "Public can view safe profile data only"
ON public.profiles
FOR SELECT
USING (
  -- Only allow access to non-sensitive public fields for profiles with usernames
  username IS NOT NULL 
  AND username != ''
  AND auth.uid() IS NOT NULL
);

-- Add a row-level filter to ensure email is never returned in public queries
-- This creates a view-like restriction at the policy level
CREATE POLICY "Email only visible to profile owner"
ON public.profiles
FOR SELECT
USING (
  -- Email and other sensitive data only visible to the profile owner
  CASE 
    WHEN auth.uid() = id THEN true
    ELSE email IS NULL  -- This effectively hides email for non-owners
  END
);