-- Fix Security Definer Views - Convert to Security Invoker Views
-- This addresses the security issue where views bypass RLS policies

-- Drop existing views that have security definer issues
DROP VIEW IF EXISTS public.v_featured_posts;
DROP VIEW IF EXISTS public.v_featured_public;
DROP VIEW IF EXISTS public.v_news_recent;
DROP VIEW IF EXISTS public.books_explore;
DROP VIEW IF EXISTS public.books_public;
DROP VIEW IF EXISTS public.reading_questions_public;

-- Recreate views with SECURITY INVOKER to respect user RLS policies
-- This ensures views run with the permissions of the querying user, not the creator

-- Recreate v_featured_posts with security invoker
CREATE VIEW public.v_featured_posts
WITH (security_invoker=true)
AS SELECT 
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
    bf."position",
    bf.weight
FROM blog_posts bp
JOIN blog_featured bf ON (bp.id = bf.post_id)
WHERE bp.published = true 
    AND (bp.published_at IS NULL OR bp.published_at <= now())
ORDER BY bf."position", bf.weight DESC;

-- Recreate v_featured_public with security invoker
CREATE VIEW public.v_featured_public
WITH (security_invoker=true)
AS SELECT 
    blog_posts.id,
    blog_posts.title,
    blog_posts.slug,
    blog_posts.excerpt,
    blog_posts.image_url,
    blog_posts.image_alt,
    blog_posts.published_at
FROM blog_posts
WHERE blog_posts.published = true 
    AND (blog_posts.published_at IS NULL OR blog_posts.published_at <= now()) 
    AND blog_posts.featured = true
ORDER BY blog_posts.featured_weight DESC, blog_posts.published_at DESC;

-- Recreate v_news_recent with security invoker
CREATE VIEW public.v_news_recent
WITH (security_invoker=true)
AS SELECT 
    blog_posts.id,
    blog_posts.title,
    blog_posts.slug,
    blog_posts.excerpt,
    blog_posts.author,
    blog_posts.published_at,
    blog_posts.image_url,
    blog_posts.image_alt
FROM blog_posts
WHERE blog_posts.is_news = true 
    AND blog_posts.published = true 
    AND blog_posts.published_at >= (now() - '48:00:00'::interval)
ORDER BY blog_posts.published_at DESC;

-- Recreate books_explore with security invoker
CREATE VIEW public.books_explore
WITH (security_invoker=true)
AS SELECT 
    b.id,
    b.title,
    b.author,
    b.slug,
    b.cover_url,
    b.description,
    b.total_pages,
    b.created_at,
    b.tags,
    b.is_published,
    b.total_chapters,
    b.expected_segments,
    CASE
        WHEN (b.tags @> ARRAY['Religion'::text]) THEN 'religion'::text
        WHEN (b.tags @> ARRAY['Essai'::text]) THEN 'essai'::text
        WHEN (b.tags && ARRAY['Biographie'::text, 'Autobiographie'::text]) THEN 'bio'::text
        ELSE 'litterature'::text
    END AS category
FROM books b
WHERE COALESCE(b.is_published, false) = true;

-- Recreate books_public with security invoker
CREATE VIEW public.books_public
WITH (security_invoker=true)
AS SELECT 
    books.id,
    books.title,
    books.author,
    books.slug,
    books.cover_url,
    books.description,
    books.tags,
    books.total_pages,
    books.total_chapters,
    books.expected_segments
FROM books
WHERE books.is_published = true;

-- Recreate reading_questions_public with security invoker
CREATE VIEW public.reading_questions_public
WITH (security_invoker=true)
AS SELECT 
    reading_questions.id,
    reading_questions.book_id,
    reading_questions.book_slug,
    reading_questions.segment,
    reading_questions.question
FROM reading_questions;