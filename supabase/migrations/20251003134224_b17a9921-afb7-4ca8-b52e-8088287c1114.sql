-- Table pour les demandes de livres Premium
CREATE TABLE IF NOT EXISTS public.book_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_title TEXT NOT NULL,
  book_author TEXT,
  isbn TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.book_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert own requests
CREATE POLICY "Users can insert own requests"
ON public.book_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view own requests
CREATE POLICY "Users can view own requests"
ON public.book_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all requests"
ON public.book_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Policy: Admins can update all requests
CREATE POLICY "Admins can update all requests"
ON public.book_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_book_requests_user ON public.book_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_book_requests_status ON public.book_requests(status);
CREATE INDEX IF NOT EXISTS idx_book_requests_created ON public.book_requests(created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_book_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_book_requests_updated_at
BEFORE UPDATE ON public.book_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_book_requests_updated_at();

-- Comments
COMMENT ON TABLE public.book_requests IS 'Premium users book addition requests';
COMMENT ON COLUMN public.book_requests.status IS 'Request status: pending, processing, completed, rejected';