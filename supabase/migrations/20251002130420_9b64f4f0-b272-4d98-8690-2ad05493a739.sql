-- Add premium columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_since TIMESTAMPTZ;

-- Add index for fast premium queries
CREATE INDEX IF NOT EXISTS idx_profiles_premium ON profiles(is_premium) WHERE is_premium = true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_premium IS 'Whether user has active premium subscription';
COMMENT ON COLUMN profiles.premium_since IS 'Timestamp when user first became premium';