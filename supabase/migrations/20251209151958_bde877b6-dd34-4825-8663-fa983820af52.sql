-- Add personalization columns for onboarding (no conflict with existing columns)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_objective text,
ADD COLUMN IF NOT EXISTS favorite_genres text[];