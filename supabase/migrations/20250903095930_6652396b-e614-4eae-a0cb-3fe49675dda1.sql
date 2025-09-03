-- Vérifier quelques exemples de livres avec leurs couvertures
SELECT 
  id,
  title,
  author,
  cover_url,
  LENGTH(cover_url) as url_length
FROM books_public 
WHERE title IN ('Albertine disparue', 'L''Écume des jours', 'Le Grand Meaulnes')
ORDER BY title;