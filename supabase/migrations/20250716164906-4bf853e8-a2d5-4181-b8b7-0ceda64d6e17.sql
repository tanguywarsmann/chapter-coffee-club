-- Fonction pour récupérer le fil d'activité social
CREATE OR REPLACE FUNCTION public.get_activity_feed(uid uuid, lim int default 20)
RETURNS table (
  actor_id      uuid,
  actor_name    text,
  actor_avatar  text,
  kind          text,     -- 'finished', 'badge', 'started'
  payload_id    text,     -- book_id ou badge_id
  payload_title text,     -- titre livre ou label badge
  posted_at     timestamptz
) 
LANGUAGE sql 
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Livres terminés
  SELECT
    p.id,
    p.username,
    '/placeholder.svg'::text,
    'finished'::text,
    rp.book_id,
    b.title,
    rp.updated_at
  FROM reading_progress rp
  JOIN books b ON b.id = rp.book_id
  JOIN profiles p ON p.id = rp.user_id
  WHERE rp.status = 'completed'
    AND rp.user_id <> uid
    AND rp.updated_at >= NOW() - INTERVAL '30 days'

  UNION ALL
  
  -- Badges gagnés
  SELECT
    p.id,
    p.username,
    '/placeholder.svg'::text,
    'badge'::text,
    ub.badge_id::text,
    bd.label,
    ub.earned_at
  FROM user_badges ub
  JOIN badges bd ON bd.id = ub.badge_id::uuid
  JOIN profiles p ON p.id = ub.user_id
  WHERE ub.user_id <> uid
    AND ub.earned_at >= NOW() - INTERVAL '30 days'

  UNION ALL
  
  -- Nouveaux livres commencés
  SELECT
    p.id,
    p.username,
    '/placeholder.svg'::text,
    'started'::text,
    rp.book_id,
    b.title,
    rp.started_at
  FROM reading_progress rp
  JOIN books b ON b.id = rp.book_id
  JOIN profiles p ON p.id = rp.user_id
  WHERE rp.status = 'in_progress'
    AND rp.user_id <> uid
    AND rp.started_at >= NOW() - INTERVAL '7 days'

  ORDER BY posted_at DESC
  LIMIT lim;
$$;