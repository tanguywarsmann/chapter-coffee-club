-- Drop and recreate books_explore view to allow books in multiple categories
DROP VIEW IF EXISTS books_explore;

CREATE VIEW books_explore AS
-- Livres Religion (exclusif)
SELECT id, title, author, slug, cover_url, description, total_pages, 
       created_at, tags, is_published, total_chapters, expected_segments,
       'religion'::text as category
FROM books WHERE tags @> ARRAY['Religion'::text] AND COALESCE(is_published, false) = true

UNION ALL

-- Livres Essai dans catégorie Essai
SELECT id, title, author, slug, cover_url, description, total_pages,
       created_at, tags, is_published, total_chapters, expected_segments,
       'essai'::text as category
FROM books WHERE tags @> ARRAY['Essai'::text] AND COALESCE(is_published, false) = true

UNION ALL

-- Livres Essai AUSSI dans Littérature
SELECT id, title, author, slug, cover_url, description, total_pages,
       created_at, tags, is_published, total_chapters, expected_segments,
       'litterature'::text as category
FROM books WHERE tags @> ARRAY['Essai'::text] AND COALESCE(is_published, false) = true

UNION ALL

-- Livres Bio dans catégorie Bio
SELECT id, title, author, slug, cover_url, description, total_pages,
       created_at, tags, is_published, total_chapters, expected_segments,
       'bio'::text as category
FROM books WHERE tags && ARRAY['Biographie'::text, 'Autobiographie'::text] AND COALESCE(is_published, false) = true

UNION ALL

-- Livres Bio AUSSI dans Littérature
SELECT id, title, author, slug, cover_url, description, total_pages,
       created_at, tags, is_published, total_chapters, expected_segments,
       'litterature'::text as category
FROM books WHERE tags && ARRAY['Biographie'::text, 'Autobiographie'::text] AND COALESCE(is_published, false) = true

UNION ALL

-- Autres livres uniquement dans Littérature (sans Religion, Essai, Bio)
SELECT id, title, author, slug, cover_url, description, total_pages,
       created_at, tags, is_published, total_chapters, expected_segments,
       'litterature'::text as category
FROM books 
WHERE NOT (tags @> ARRAY['Religion'::text] OR tags @> ARRAY['Essai'::text] OR tags && ARRAY['Biographie'::text, 'Autobiographie'::text])
AND COALESCE(is_published, false) = true;