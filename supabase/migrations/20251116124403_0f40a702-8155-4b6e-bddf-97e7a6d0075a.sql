-- Create user_companion table for Booky the Fox feature
CREATE TABLE IF NOT EXISTS public.user_companion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_stage INTEGER NOT NULL DEFAULT 1,
  total_reading_days INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_reading_date DATE,
  segments_this_week INTEGER NOT NULL DEFAULT 0,
  has_seen_birth_ritual BOOLEAN NOT NULL DEFAULT false,
  has_seen_week_ritual BOOLEAN NOT NULL DEFAULT false,
  has_seen_return_ritual BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_companion ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own companion
CREATE POLICY "Users can view their own companion"
  ON public.user_companion
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own companion"
  ON public.user_companion
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companion"
  ON public.user_companion
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_companion_user_id ON public.user_companion(user_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_companion_updated_at
  BEFORE UPDATE ON public.user_companion
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();