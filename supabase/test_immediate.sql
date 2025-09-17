-- Test direct de la fonction
SELECT public.force_validate_segment_beta(
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
  'test',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  false,
  true
);

-- Vérifier les données (sans RLS)
SELECT * FROM reading_progress WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b' LIMIT 5;
SELECT * FROM reading_validations WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b' LIMIT 5;

-- Compter tout
SELECT 'progress' as table_name, count(*) FROM reading_progress WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b'
UNION ALL
SELECT 'validations', count(*) FROM reading_validations WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b';