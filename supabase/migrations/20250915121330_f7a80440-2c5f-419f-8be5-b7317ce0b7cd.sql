-- Add optional multi-device onboarding columns to profiles
alter table public.profiles
  add column if not exists onboarding_seen_at timestamp with time zone,
  add column if not exists onboarding_version int;

-- Add index for performance
create index if not exists idx_profiles_onboarding on public.profiles(onboarding_version);