-- Test avec vos IDs réels
SELECT public.force_validate_segment_beta(
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,  -- book_id
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,  -- question_id
  'test réponse',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,  -- user_id
  false,
  true
);

-- Vérifier les données
SELECT book_id, current_page, updated_at 
FROM reading_progress 
WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid
ORDER BY updated_at DESC LIMIT 5;

-- Vérifier RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('reading_progress', 'reading_validations');

-- Test avec paramètres manquants (doit retourner erreur gracieuse)
SELECT public.force_validate_segment_beta(
  NULL,  -- book_id manquant
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
  'test',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  false,
  true
);

-- Test avec question inexistante (doit gérer gracieusement)
SELECT public.force_validate_segment_beta(
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,
  gen_random_uuid(),  -- question_id aléatoire
  'test',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  false,
  true
);