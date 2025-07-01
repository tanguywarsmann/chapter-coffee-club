
-- Mettre à jour les articles existants avec des dates de publication réalistes
-- et créer un calendrier de publication quotidien à partir d'aujourd'hui

-- Article allemand - publié hier (30 juin 2025)
UPDATE public.blog_posts 
SET 
  created_at = '2025-06-30 09:00:00+00'::timestamptz,
  updated_at = '2025-06-30 09:00:00+00'::timestamptz
WHERE slug = 'quel-classique-allemand-te-ressemble';

-- Article russe - publié aujourd'hui (1er juillet 2025)
UPDATE public.blog_posts 
SET 
  created_at = '2025-07-01 10:00:00+00'::timestamptz,
  updated_at = '2025-07-01 10:00:00+00'::timestamptz
WHERE slug = 'quel-roman-russe-te-ressemble';

-- Article romans anglais - publié avant-hier (29 juin 2025)
UPDATE public.blog_posts 
SET 
  created_at = '2025-06-29 14:30:00+00'::timestamptz,
  updated_at = '2025-06-29 14:30:00+00'::timestamptz
WHERE slug = 'romans-anglais-pour-recommencer';

-- Article classiques pour recommencer - publié il y a 3 jours (28 juin 2025)
UPDATE public.blog_posts 
SET 
  created_at = '2025-06-28 16:15:00+00'::timestamptz,
  updated_at = '2025-06-28 16:15:00+00'::timestamptz
WHERE slug = 'classiques-pour-recommencer';
