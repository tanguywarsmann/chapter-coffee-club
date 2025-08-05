-- Corriger les noms d'utilisateur manquants avec une approche simple

BEGIN;
SET ROLE service_role;

-- Mettre à jour les profils sans username en utilisant l'email pour générer un nom
UPDATE public.profiles 
SET username = SUBSTRING(email FROM '^(.+)@')
WHERE username IS NULL;

RESET ROLE;
COMMIT;