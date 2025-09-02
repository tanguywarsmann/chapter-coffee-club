-- Create public views for security and performance
CREATE OR REPLACE VIEW public.reading_questions_public AS
SELECT id, book_slug, segment, question, book_id
FROM public.reading_questions;

CREATE OR REPLACE VIEW public.books_public AS  
SELECT id, slug, title, author, cover_url, expected_segments, total_chapters, total_pages, description, tags
FROM public.books
WHERE is_published = true;

-- Grant permissions on views
GRANT SELECT ON public.reading_questions_public TO anon, authenticated;
GRANT SELECT ON public.books_public TO anon, authenticated;

-- Enable RLS on books table and restrict access to published books only
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS books_select_published ON public.books;

-- Create new policy for published books only
CREATE POLICY books_select_published ON public.books FOR SELECT USING (is_published = true);

-- Revoke direct access to books table (users should use books_public view)
REVOKE SELECT ON public.books FROM anon, authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reading_questions_book_slug_segment ON public.reading_questions(book_slug, segment);
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_slug_unique ON public.books(slug);
CREATE INDEX IF NOT EXISTS idx_books_published_updated_at ON public.books(updated_at DESC) WHERE is_published = true;