-- Fix security issues: Remove SECURITY DEFINER from views if present
-- and ensure proper RLS policies

-- First, let's check what views have SECURITY DEFINER
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
  AND definition ILIKE '%SECURITY DEFINER%';

-- Drop and recreate books_public view without SECURITY DEFINER
DROP VIEW IF EXISTS public.books_public;

-- Recreate books_public view with proper security model
CREATE VIEW public.books_public AS
SELECT 
  id, 
  title, 
  author, 
  cover_url, 
  description, 
  expected_segments, 
  total_chapters, 
  total_pages,
  slug, 
  tags
FROM public.books 
WHERE is_published = true;

-- Grant access to the view
GRANT SELECT ON public.books_public TO anon, authenticated;

-- Comment on the view for clarity
COMMENT ON VIEW public.books_public IS 'Public view of published books without admin fields. Used by client applications.';

-- Verify the view works correctly
SELECT COUNT(*) as view_count FROM public.books_public;