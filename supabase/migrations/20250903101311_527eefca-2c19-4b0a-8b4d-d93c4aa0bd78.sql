-- Corriger les URLs des couvertures qui ont des doubles slashes
UPDATE books 
SET cover_url = REPLACE(cover_url, '//', '/') 
WHERE cover_url LIKE '%//%';