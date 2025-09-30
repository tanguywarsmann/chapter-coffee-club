-- Supprimer et recréer les vues sans SECURITY DEFINER
DROP VIEW IF EXISTS books_public CASCADE;
DROP VIEW IF EXISTS reading_questions_public CASCADE;
DROP VIEW IF EXISTS v_featured_posts CASCADE;
DROP VIEW IF EXISTS v_featured_public CASCADE;

-- Recréer books_public sans SECURITY DEFINER
CREATE VIEW books_public AS
SELECT 
    id,
    title,
    author,
    slug,
    cover_url,
    description,
    tags,
    total_pages,
    total_chapters,
    expected_segments
FROM books 
WHERE is_published = true;

-- Recréer reading_questions_public sans SECURITY DEFINER
CREATE VIEW reading_questions_public AS
SELECT 
    id,
    book_id,
    book_slug,
    segment,
    question
FROM reading_questions;

-- Recréer v_featured_posts sans SECURITY DEFINER
CREATE VIEW v_featured_posts AS
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
AND (bp.published_at IS NULL OR bp.published_at <= now())
ORDER BY bf.position, bf.weight DESC;

-- Recréer v_featured_public sans SECURITY DEFINER
CREATE VIEW v_featured_public AS
SELECT 
    id,
    title,
    slug,
    excerpt,
    image_url,
    image_alt,
    published_at
FROM blog_posts
WHERE published = true 
AND (published_at IS NULL OR published_at <= now())
AND featured = true
ORDER BY featured_weight DESC, published_at DESC;