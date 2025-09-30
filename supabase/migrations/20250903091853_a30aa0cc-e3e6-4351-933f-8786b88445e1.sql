-- Identify and fix all views with SECURITY DEFINER issues

-- Check which views still have SECURITY DEFINER
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' 
ORDER BY viewname;

-- Fix v_featured_posts view if it has SECURITY DEFINER
DROP VIEW IF EXISTS public.v_featured_posts CASCADE;
CREATE VIEW public.v_featured_posts AS
SELECT 
  bp.id,
  bp.title,
  bp.slug,
  bp.content,
  bp.excerpt,
  bp.author,
  bp.tags,
  bp.image_url,
  bp.image_alt,
  bp.published,
  bp.published_at,
  bp.created_at,
  bp.updated_at,
  bf.position,
  bf.weight
FROM blog_posts bp
JOIN blog_featured bf ON bp.id = bf.post_id
WHERE bp.published = true
  AND (bp.published_at IS NULL OR bp.published_at <= NOW())
  AND bf.start_at <= NOW()
  AND (bf.end_at IS NULL OR bf.end_at > NOW())
ORDER BY bf.position, bf.weight DESC;

-- Fix v_featured_public view if it has SECURITY DEFINER  
DROP VIEW IF EXISTS public.v_featured_public CASCADE;
CREATE VIEW public.v_featured_public AS
SELECT 
  id,
  title,
  slug,
  excerpt,
  image_url,
  image_alt,
  published_at
FROM v_featured_posts
ORDER BY published_at DESC;

-- Grant proper permissions
GRANT SELECT ON public.v_featured_posts TO anon, authenticated;
GRANT SELECT ON public.v_featured_public TO anon, authenticated;

-- Add comments for clarity
COMMENT ON VIEW public.v_featured_posts IS 'View of featured blog posts without SECURITY DEFINER';
COMMENT ON VIEW public.v_featured_public IS 'Public view of featured posts without SECURITY DEFINER';

-- Verify views work
SELECT COUNT(*) as featured_posts_count FROM public.v_featured_posts;
SELECT COUNT(*) as featured_public_count FROM public.v_featured_public;