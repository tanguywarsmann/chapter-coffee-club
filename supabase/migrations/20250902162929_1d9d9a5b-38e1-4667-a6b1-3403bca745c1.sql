-- Fix security issues: Recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS public.reading_questions_public;
DROP VIEW IF EXISTS public.books_public;

-- Create views without SECURITY DEFINER (they will use SECURITY INVOKER by default)
CREATE VIEW public.reading_questions_public AS
SELECT id, book_slug, segment, question, book_id
FROM public.reading_questions;

CREATE VIEW public.books_public AS  
SELECT id, slug, title, author, cover_url, expected_segments, total_chapters, total_pages, description, tags
FROM public.books
WHERE is_published = true;

-- Grant permissions on views
GRANT SELECT ON public.reading_questions_public TO anon, authenticated;
GRANT SELECT ON public.books_public TO anon, authenticated;