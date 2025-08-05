-- Corriger les noms d'utilisateur manquants

BEGIN;
SET ROLE service_role;

-- Mettre à jour tous les profils qui n'ont pas de username
UPDATE public.profiles 
SET username = 'lecteur' || LPAD(
  (ROW_NUMBER() OVER (ORDER BY created_at))::TEXT, 
  3, 
  '0'
)
WHERE username IS NULL;

RESET ROLE;
COMMIT;