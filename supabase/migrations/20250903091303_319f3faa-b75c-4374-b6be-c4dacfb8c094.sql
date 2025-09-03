-- Test query to verify books_public view is working correctly
-- and contains necessary data

-- Check if books_public has data
SELECT 
  COUNT(*) as total_books,
  COUNT(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as books_with_title,
  COUNT(CASE WHEN author IS NOT NULL AND author != '' THEN 1 END) as books_with_author,
  COUNT(CASE WHEN cover_url IS NOT NULL THEN 1 END) as books_with_cover,
  COUNT(CASE WHEN expected_segments IS NOT NULL THEN 1 END) as books_with_segments
FROM books_public;

-- Verify some sample data exists
SELECT id, title, author, expected_segments, slug
FROM books_public 
WHERE title IS NOT NULL 
LIMIT 5;