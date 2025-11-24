-- =============================================
-- Script d'injection : Livres terminés avec dates précises
-- Utilise completed_at pour le feed (pas updated_at)
-- Date: 2025-11-24
-- =============================================

WITH real_users AS (
  SELECT id AS user_id
  FROM public.profiles
  WHERE COALESCE(email, '') NOT LIKE 'fake_user_%'
    AND COALESCE(username, '') NOT LIKE 'Fake user %'
),
eligible_books AS (
  SELECT id AS book_id, expected_segments
  FROM public.books
  WHERE expected_segments > 0
    AND COALESCE(tags::text, '') NOT ILIKE '%religion%'
    AND COALESCE(tags::text, '') NOT ILIKE '%bible%'
    AND COALESCE(tags::text, '') NOT ILIKE '%talmud%'
    AND COALESCE(tags::text, '') NOT ILIKE '%judaïsme%'
    AND COALESCE(tags::text, '') NOT ILIKE '%judaisme%'
),
candidate_pairs AS (
  SELECT
    u.user_id,
    b.book_id,
    b.expected_segments AS segment,
    row_number() OVER (ORDER BY u.user_id, b.book_id) AS global_rn,
    row_number() OVER (PARTITION BY u.user_id ORDER BY b.book_id) AS rn_per_user,
    row_number() OVER (PARTITION BY b.book_id ORDER BY u.user_id) AS rn_per_book
  FROM real_users u
  CROSS JOIN eligible_books b
  WHERE NOT EXISTS (
    SELECT 1 FROM public.reading_progress rp
    WHERE rp.user_id = u.user_id
      AND rp.book_id = b.book_id
      AND rp.status = 'completed'
  )
),
filtered_pairs AS (
  SELECT *
  FROM candidate_pairs
  WHERE rn_per_user = 1 AND rn_per_book = 1
),
selected AS (
  SELECT
    user_id,
    book_id,
    segment,
    row_number() OVER (ORDER BY global_rn) AS rn
  FROM filtered_pairs
  ORDER BY global_rn
  LIMIT 32
),
dated AS (
  SELECT
    user_id,
    book_id,
    segment,
    CASE
      WHEN rn BETWEEN  1 AND  5 THEN TIMESTAMPTZ '2025-11-19 12:00:00+00'
      WHEN rn BETWEEN  6 AND 11 THEN TIMESTAMPTZ '2025-11-20 12:00:00+00'
      WHEN rn BETWEEN 12 AND 16 THEN TIMESTAMPTZ '2025-11-21 12:00:00+00'
      WHEN rn BETWEEN 17 AND 21 THEN TIMESTAMPTZ '2025-11-22 12:00:00+00'
      WHEN rn BETWEEN 22 AND 26 THEN TIMESTAMPTZ '2025-11-23 12:00:00+00'
      WHEN rn BETWEEN 27 AND 32 THEN TIMESTAMPTZ '2025-11-24 12:00:00+00'
    END AS completed_at
  FROM selected
)
-- 1. Créer ou mettre à jour reading_progress avec status='completed' et completed_at
INSERT INTO public.reading_progress (
  id,
  user_id,
  book_id,
  current_page,
  total_pages,
  status,
  started_at,
  updated_at,
  completed_at
)
SELECT
  gen_random_uuid(),
  d.user_id,
  d.book_id,
  d.segment * 20, -- Page approximative
  1000, -- Total pages par défaut
  'completed',
  d.completed_at - INTERVAL '7 days', -- Commencé 7 jours avant
  d.completed_at, -- updated_at = completed_at
  d.completed_at -- IMPORTANT: completed_at défini
FROM dated d
ON CONFLICT (user_id, book_id) 
DO UPDATE SET
  status = 'completed',
  current_page = GREATEST(reading_progress.current_page, EXCLUDED.current_page),
  updated_at = EXCLUDED.completed_at,
  completed_at = COALESCE(reading_progress.completed_at, EXCLUDED.completed_at);

-- 2. Insérer la validation du dernier segment (optionnel mais cohérent)
WITH progress_ids AS (
  SELECT
    rp.id AS progress_id,
    d.user_id,
    d.book_id,
    d.segment,
    d.completed_at
  FROM dated d
  JOIN public.reading_progress rp ON rp.user_id = d.user_id AND rp.book_id = d.book_id
)
INSERT INTO public.reading_validations (
  id,
  user_id,
  book_id,
  segment,
  validated_at,
  question_id,
  answer,
  correct,
  progress_id,
  used_joker,
  revealed_answer_at
)
SELECT
  gen_random_uuid(),
  p.user_id,
  p.book_id,
  p.segment,
  p.completed_at,
  NULL,
  NULL,
  TRUE,
  p.progress_id,
  FALSE,
  NULL
FROM progress_ids p
ON CONFLICT (user_id, book_id, segment) DO NOTHING;

-- Vérification
SELECT
  DATE(completed_at) AS date,
  COUNT(*) AS livres_terminés
FROM public.reading_progress
WHERE status = 'completed'
  AND completed_at >= '2025-11-19'
  AND completed_at <= '2025-11-24'
GROUP BY DATE(completed_at)
ORDER BY date;
