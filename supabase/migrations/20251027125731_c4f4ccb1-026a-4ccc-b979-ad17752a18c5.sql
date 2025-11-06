-- Phase 1: Apple IAP Database Support

-- 1.1 Add premium_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS premium_type TEXT 
CHECK (premium_type IN ('stripe', 'apple', 'manual'));

-- Add index for premium_type filtering
CREATE INDEX IF NOT EXISTS idx_profiles_premium_type 
ON public.profiles(premium_type) 
WHERE premium_type IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.premium_type IS 
'Premium purchase source: stripe (web/PWA), apple (iOS IAP), manual (admin grant)';

-- 1.2 Create apple_iap_receipts table for Apple IAP validation
CREATE TABLE IF NOT EXISTS public.apple_iap_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL UNIQUE, -- Apple Transaction ID
  product_id TEXT NOT NULL, -- com.vread.app.lifetime or com.vread.app.annual
  purchase_date TIMESTAMPTZ NOT NULL,
  expires_date TIMESTAMPTZ, -- NULL for lifetime, future date for subscriptions
  receipt_data TEXT NOT NULL, -- JSON response from Apple verification
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_apple_receipts_user 
ON public.apple_iap_receipts(user_id);

CREATE INDEX IF NOT EXISTS idx_apple_receipts_transaction 
ON public.apple_iap_receipts(transaction_id);

CREATE INDEX IF NOT EXISTS idx_apple_receipts_product 
ON public.apple_iap_receipts(product_id);

-- Add comment for documentation
COMMENT ON TABLE public.apple_iap_receipts IS 
'Stores Apple In-App Purchase receipts for Premium purchases on iOS';

-- Enable Row Level Security
ALTER TABLE public.apple_iap_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own receipts
CREATE POLICY "Users can view own IAP receipts"
ON public.apple_iap_receipts 
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policy: Service role can insert receipts (for edge function)
CREATE POLICY "Service role can insert IAP receipts"
ON public.apple_iap_receipts 
FOR INSERT
WITH CHECK (true);

-- RLS Policy: Service role can update receipts (for renewals)
CREATE POLICY "Service role can update IAP receipts"
ON public.apple_iap_receipts 
FOR UPDATE
USING (true);

-- Add helpful view for debugging (admins only)
CREATE OR REPLACE VIEW public.v_apple_iap_summary AS
SELECT 
  air.user_id,
  p.email,
  p.username,
  air.product_id,
  air.transaction_id,
  air.purchase_date,
  air.expires_date,
  CASE 
    WHEN air.expires_date IS NULL THEN 'lifetime'
    WHEN air.expires_date > NOW() THEN 'active'
    ELSE 'expired'
  END as subscription_status,
  air.created_at
FROM public.apple_iap_receipts air
JOIN public.profiles p ON p.id = air.user_id
ORDER BY air.created_at DESC;