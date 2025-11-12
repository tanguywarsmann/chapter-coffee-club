-- Script de test pour la suppression de compte
-- Exécutez ce script dans Supabase SQL Editor pour tester la fonction cleanup_user_data

-- 1. Vérifier que la fonction existe et retourne bien JSON
SELECT
  proname as function_name,
  prorettype::regtype as return_type,
  prosrc as source_code_length
FROM pg_proc
WHERE proname = 'cleanup_user_data';

-- Devrait retourner: cleanup_user_data | json | (longueur du code)
-- Si retourne "void", la migration n'est pas appliquée!


-- 2. Vérifier les tables qui existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'reading_validations',
    'reading_progress',
    'user_badges',
    'user_favorite_badges',
    'user_favorite_books',
    'user_levels',
    'user_monthly_rewards',
    'user_quests',
    'validation_locks',
    'followers',
    'book_chats',
    'posts',
    'comments',
    'likes'
  )
ORDER BY table_name;


-- 3. Tester la fonction avec un faux UUID (ne devrait rien supprimer mais ne devrait pas crasher)
SELECT cleanup_user_data('00000000-0000-0000-0000-000000000000'::uuid);

-- Devrait retourner:
-- {"success": true, "user_id": "00000000-0000-0000-0000-000000000000", "message": "User data successfully cleaned up"}
-- OU
-- {"success": false, "error": "[message d'erreur]", "user_id": "..."}


-- 4. Pour tester avec un vrai utilisateur (ATTENTION: cela supprimera VRAIMENT les données!)
-- Décommentez SEULEMENT si vous êtes sûr:
-- SELECT cleanup_user_data('VOTRE_USER_ID_TEST'::uuid);


-- 5. Vérifier les contraintes de clés étrangères qui pourraient bloquer
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (
    kcu.column_name = 'user_id'
    OR kcu.column_name = 'follower_id'
    OR kcu.column_name = 'following_id'
  )
ORDER BY tc.table_name, tc.constraint_name;

-- Vérifiez que delete_rule est 'CASCADE' ou 'SET NULL' pour éviter les blocages
