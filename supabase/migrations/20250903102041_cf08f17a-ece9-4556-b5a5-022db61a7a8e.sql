-- Corriger les URLs en restaurant le double slash après https:
UPDATE books 
SET cover_url = REPLACE(cover_url, 'https:/', 'https://') 
WHERE cover_url LIKE 'https:/%' AND cover_url NOT LIKE 'https://%';