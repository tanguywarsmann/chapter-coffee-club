
-- Créer un profil de lecteur expert en utilisant les vrais UUIDs des badges

-- 1. Nettoyer d'abord toutes les données existantes pour cet utilisateur
DELETE FROM public.reading_validations WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b';
DELETE FROM public.reading_progress WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b';
DELETE FROM public.user_badges WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b';
DELETE FROM public.user_quests WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b';
DELETE FROM public.user_favorite_badges WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b';
DELETE FROM public.user_favorite_books WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b';
DELETE FROM public.user_monthly_rewards WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b';

-- 2. Mettre à jour le niveau utilisateur avec beaucoup d'XP
INSERT INTO public.user_levels (user_id, xp, level, last_updated)
VALUES ('f5e55556-c5ae-40dc-9909-88600a13393b', 1500, 5, NOW())
ON CONFLICT (user_id) 
DO UPDATE SET 
  xp = 1500,
  level = 5,
  last_updated = NOW();

-- 3. Créer des progressions de lecture avec les premiers livres disponibles
WITH available_books AS (
  SELECT id, title, total_pages, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.books 
  WHERE is_published = true
  LIMIT 7
)
INSERT INTO public.reading_progress (user_id, book_id, current_page, total_pages, status, started_at, updated_at, streak_current, streak_best)
SELECT 
  'f5e55556-c5ae-40dc-9909-88600a13393b',
  ab.id,
  CASE 
    WHEN ab.rn <= 5 THEN ab.total_pages  -- Livres terminés
    ELSE GREATEST(1, FLOOR(ab.total_pages * 0.7))  -- Livres en cours (70% de progression)
  END as current_page,
  ab.total_pages,
  CASE 
    WHEN ab.rn <= 5 THEN 'completed'::reading_status
    ELSE 'in_progress'::reading_status
  END,
  NOW() - INTERVAL '50 days' + (ab.rn * INTERVAL '5 days'),
  CASE 
    WHEN ab.rn <= 5 THEN NOW() - INTERVAL '40 days' + (ab.rn * INTERVAL '5 days')
    ELSE NOW()
  END,
  45,
  45
FROM available_books ab;

-- 4. Générer 29 validations de lecture pour ce mois-ci
WITH available_books AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.books 
  WHERE is_published = true
  LIMIT 5
),
validation_dates AS (
  SELECT 
    date_trunc('month', CURRENT_DATE) + (generate_series(0, 28) * INTERVAL '1 day') AS validation_date,
    generate_series(1, 29) AS segment_num
),
book_cycle AS (
  SELECT 
    vd.validation_date,
    vd.segment_num,
    ab.id as book_id
  FROM validation_dates vd
  CROSS JOIN available_books ab
  WHERE ab.rn = ((vd.segment_num - 1) % 5) + 1
)
INSERT INTO public.reading_validations (user_id, book_id, segment, correct, validated_at, answer, progress_id)
SELECT 
  'f5e55556-c5ae-40dc-9909-88600a13393b',
  bc.book_id,
  bc.segment_num,
  true,
  bc.validation_date + (INTERVAL '1 hour' * (bc.segment_num % 24)),
  'Réponse correcte du lecteur expert',
  (SELECT id FROM public.reading_progress WHERE user_id = 'f5e55556-c5ae-40dc-9909-88600a13393b' AND book_id = bc.book_id LIMIT 1)
FROM book_cycle bc;

-- 5. Attribuer tous les badges disponibles (en utilisant les vrais UUIDs de la table badges)
WITH available_badges AS (
  SELECT id, slug, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.badges
  LIMIT 10
)
INSERT INTO public.user_badges (user_id, badge_id, earned_at)
SELECT 
  'f5e55556-c5ae-40dc-9909-88600a13393b',
  ab.id,
  NOW() - INTERVAL '45 days' + (ab.rn * INTERVAL '3 days')
FROM available_badges ab;

-- 6. Compléter toutes les quêtes disponibles
INSERT INTO public.user_quests (user_id, quest_slug, unlocked_at)
VALUES 
  ('f5e55556-c5ae-40dc-9909-88600a13393b', 'triple_valide', NOW() - INTERVAL '40 days'),
  ('f5e55556-c5ae-40dc-9909-88600a13393b', 'multi_booker', NOW() - INTERVAL '35 days'),
  ('f5e55556-c5ae-40dc-9909-88600a13393b', 'back_on_track', NOW() - INTERVAL '20 days'),
  ('f5e55556-c5ae-40dc-9909-88600a13393b', 'early_reader', NOW() - INTERVAL '15 days');

-- 7. Ajouter quelques badges favoris (en utilisant les slugs des badges)
WITH favorite_badge_slugs AS (
  SELECT slug, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.badges
  LIMIT 3
)
INSERT INTO public.user_favorite_badges (user_id, badge_id, created_at)
SELECT 
  'f5e55556-c5ae-40dc-9909-88600a13393b',
  fbs.slug,
  NOW() - INTERVAL '10 days' + (fbs.rn * INTERVAL '2 days')
FROM favorite_badge_slugs fbs;

-- 8. Ajouter des livres favoris (avec les titres des vrais livres)
WITH favorite_books AS (
  SELECT title, ROW_NUMBER() OVER (ORDER BY created_at) as position
  FROM public.books 
  WHERE is_published = true
  LIMIT 3
)
INSERT INTO public.user_favorite_books (user_id, book_title, position, added_at)
SELECT 
  'f5e55556-c5ae-40dc-9909-88600a13393b',
  fb.title,
  fb.position,
  NOW() - INTERVAL '30 days' + (fb.position * INTERVAL '5 days')
FROM favorite_books fb;

-- 9. Ajouter une récompense mensuelle (en utilisant un slug de badge)
WITH monthly_badge AS (
  SELECT slug
  FROM public.badges
  LIMIT 1
)
INSERT INTO public.user_monthly_rewards (user_id, month, badge_id, unlocked_at)
SELECT 
  'f5e55556-c5ae-40dc-9909-88600a13393b',
  '2025-06',
  mb.slug,
  NOW() - INTERVAL '15 days'
FROM monthly_badge mb;
