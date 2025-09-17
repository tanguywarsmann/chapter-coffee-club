-- Hotfix validation RLS policies
-- Ensure proper RLS policies for reading_progress and reading_validations

-- Drop potentially conflicting policies first
DROP POLICY IF EXISTS "Allow update to own progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Allow insert to own progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Allow read access to own progress" ON public.reading_progress;

-- Create comprehensive RLS policies for reading_progress
CREATE POLICY "Allow update own progress"
ON public.reading_progress
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow insert own progress"
ON public.reading_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow read own progress"
ON public.reading_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Drop potentially conflicting policies for reading_validations
DROP POLICY IF EXISTS "Allow insert to own validations" ON public.reading_validations;
DROP POLICY IF EXISTS "Allow read access to own validations" ON public.reading_validations;

-- Create comprehensive RLS policies for reading_validations
CREATE POLICY "Allow insert own validation"
ON public.reading_validations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    progress_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.reading_progress rp
      WHERE rp.id = progress_id AND rp.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Allow read own validations"
ON public.reading_validations
FOR SELECT
USING (auth.uid() = user_id);

-- Add useful index for performance
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_book
ON public.reading_progress(user_id, book_id);