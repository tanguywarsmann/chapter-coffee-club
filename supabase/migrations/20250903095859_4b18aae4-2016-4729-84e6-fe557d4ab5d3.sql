-- Test des données de couverture et livres disponibles
SELECT 
  'Albertine disparue' as search_term,
  COUNT(*) as found_books
FROM books_public 
WHERE title ILIKE '%albertine%'

UNION ALL

SELECT 
  'Ecume des jours' as search_term,
  COUNT(*) as found_books
FROM books_public 
WHERE title ILIKE '%écume%'

UNION ALL

SELECT 
  'Le Grand Meaulnes' as search_term,
  COUNT(*) as found_books
FROM books_public 
WHERE title ILIKE '%meaulnes%'

UNION ALL

SELECT 
  'Avec couverture' as search_term,
  COUNT(*) as found_books
FROM books_public 
WHERE cover_url IS NOT NULL AND cover_url != ''

UNION ALL

SELECT 
  'Sans couverture' as search_term,
  COUNT(*) as found_books
FROM books_public 
WHERE cover_url IS NULL OR cover_url = '';