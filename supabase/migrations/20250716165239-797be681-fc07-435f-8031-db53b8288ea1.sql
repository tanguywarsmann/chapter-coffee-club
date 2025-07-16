-- Fonction pour récupérer le fil d'activité social - Version corrigée
CREATE OR REPLACE FUNCTION public.get_activity_feed(uid uuid, lim int default 20)
RETURNS table (
  actor_id      uuid,
  actor_name    text,
  actor_avatar  text,
  kind          text,
  payload_id    text,
  payload_title text,
  posted_at     timestamptz
) 
LANGUAGE sql 
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Livres terminés
  SELECT
    p.id as actor_id,
    p.username as actor_name,
    '/placeholder.svg'::text as actor_avatar,
    'finished'::text as kind,
    rp.book_id as payload_id,
    b.title as payload_title,
    rp.updated_at as posted_at
  FROM reading_progress rp
  JOIN books b ON b.id = rp.book_id
  JOIN profiles p ON p.id = rp.user_id
  WHERE rp.status = 'completed'
    AND rp.user_id <> uid
    AND rp.updated_at >= NOW() - INTERVAL '30 days'

  UNION ALL
  
  -- Badges gagnés
  SELECT
    p.id as actor_id,
    p.username as actor_name,
    '/placeholder.svg'::text as actor_avatar,
    'badge'::text as kind,
    ub.badge_id::text as payload_id,
    bd.label as payload_title,
    ub.earned_at as posted_at
  FROM user_badges ub
  JOIN badges bd ON bd.id = ub.badge_id::uuid
  JOIN profiles p ON p.id = ub.user_id
  WHERE ub.user_id <> uid
    AND ub.earned_at >= NOW() - INTERVAL '30 days'

  UNION ALL
  
  -- Nouveaux livres commencés
  SELECT
    p.id as actor_id,
    p.username as actor_name,
    '/placeholder.svg'::text as actor_avatar,
    'started'::text as kind,
    rp.book_id as payload_id,
    b.title as payload_title,
    rp.started_at as posted_at
  FROM reading_progress rp
  JOIN books b ON b.id = rp.book_id
  JOIN profiles p ON p.id = rp.user_id
  WHERE rp.status = 'in_progress'
    AND rp.user_id <> uid
    AND rp.started_at >= NOW() - INTERVAL '7 days'

  ORDER BY posted_at DESC
  LIMIT lim;
$$;