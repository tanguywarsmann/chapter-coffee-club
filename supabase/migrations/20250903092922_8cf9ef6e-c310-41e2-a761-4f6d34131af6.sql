-- Vérifier les vraies données disponibles

-- 1. Regarder quelques livres avec couvertures
SELECT 
  id, 
  title, 
  author, 
  cover_url,
  slug,
  CASE 
    WHEN cover_url IS NULL THEN 'NULL'
    WHEN cover_url = '' THEN 'EMPTY'
    ELSE 'HAS_VALUE'
  END as cover_status
FROM books_public 
ORDER BY title
LIMIT 10;

-- 2. Compter les livres avec et sans couvertures
SELECT 
  COUNT(*) as total_books,
  COUNT(CASE WHEN cover_url IS NOT NULL AND cover_url != '' THEN 1 END) as books_with_covers,
  COUNT(CASE WHEN cover_url IS NULL OR cover_url = '' THEN 1 END) as books_without_covers
FROM books_public;

-- 3. Vérifier la structure de reading_questions_public
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reading_questions_public'
  AND table_schema = 'public'
ORDER BY ordinal_position;