-- Voir structure réelle des tables
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('reading_progress', 'reading_validations')
  AND column_name = 'book_id';

-- Voir si RLS bloque
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('reading_progress', 'reading_validations');

-- Tester fonction directement
SELECT force_validate_segment_beta(
  '1d6511a2-e109-4d87-b3a5-0970b9f18b07'::uuid,
  '7149d6d5-899c-4bf1-b7ae-2157105fc3ce'::uuid,
  'test',
  'f5e55556-c5ae-40dc-9909-88600a13393b'::uuid,
  false, true
);