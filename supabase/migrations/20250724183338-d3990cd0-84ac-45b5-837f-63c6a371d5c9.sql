-- Create security definer function to check admin status safely
CREATE OR REPLACE FUNCTION public.get_current_user_admin_status()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Update RLS policies to use the security definer function instead of recursive queries

-- Update badges table policies
DROP POLICY IF EXISTS "Admins can delete badges" ON public.badges;
DROP POLICY IF EXISTS "Admins can insert badges" ON public.badges;
DROP POLICY IF EXISTS "Admins can update badges" ON public.badges;

CREATE POLICY "Admins can delete badges"
ON public.badges
FOR DELETE
TO authenticated
USING (public.get_current_user_admin_status());

CREATE POLICY "Admins can insert badges"
ON public.badges
FOR INSERT
TO authenticated
WITH CHECK (public.get_current_user_admin_status());

CREATE POLICY "Admins can update badges"
ON public.badges
FOR UPDATE
TO authenticated
USING (public.get_current_user_admin_status())
WITH CHECK (public.get_current_user_admin_status());

-- Update blog_posts table policies
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (public.get_current_user_admin_status())
WITH CHECK (public.get_current_user_admin_status());

-- Update books table policies
DROP POLICY IF EXISTS "Admins can delete books" ON public.books;
DROP POLICY IF EXISTS "Admins can update books" ON public.books;

CREATE POLICY "Admins can delete books"
ON public.books
FOR DELETE
TO authenticated
USING (public.get_current_user_admin_status());

CREATE POLICY "Admins can update books"
ON public.books
FOR UPDATE
TO authenticated
USING (public.get_current_user_admin_status())
WITH CHECK (public.get_current_user_admin_status());

-- Update reading_questions table policies
DROP POLICY IF EXISTS "Admins can insert reading questions" ON public.reading_questions;

CREATE POLICY "Admins can insert reading questions"
ON public.reading_questions
FOR INSERT
TO authenticated
WITH CHECK (public.get_current_user_admin_status());

-- Update database functions to include proper search_path for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insérer une nouvelle ligne dans profiles
  -- ON CONFLICT DO NOTHING pour éviter les erreurs en cas de tentative d'insertion double
  INSERT INTO public.profiles (id, email, username, is_admin)
  VALUES (NEW.id, NEW.email, NULL, FALSE)
  ON CONFLICT (id) DO NOTHING;
  
  -- Toujours retourner NEW pour continuer l'opération sans erreur
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Capturer toute erreur pour ne pas bloquer la création de compte
    -- et journaliser l'erreur sans interrompre le flux
    RAISE LOG 'Erreur lors de la création du profil pour %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_stats(uid uuid)
RETURNS TABLE(books_read integer, pages_read integer, badges_count integer, streak_current integer, streak_best integer, quests_done integer, xp integer, lvl integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select
    /* Livres terminés */
    (select count(*)::int
       from reading_progress
      where user_id = uid
        and status   = 'completed')                                  as books_read,

    /* Pages lues en temps réel (= somme des current_page) */
    (select coalesce(sum(current_page),0)::int
       from reading_progress
      where user_id = uid)                                           as pages_read,

    /* Badges */
    (select count(*)::int
       from user_badges
      where user_id = uid)                                           as badges_count,

    /* Streaks */
    (select coalesce(max(streak_current),0)::int
       from reading_progress
      where user_id = uid)                                           as streak_current,

    (select coalesce(max(streak_best),0)::int
       from reading_progress
      where user_id = uid)                                           as streak_best,

    /* Quêtes accomplies */
    (select count(*)::int
       from user_quests
      where user_id = uid)                                           as quests_done,

    /* XP & Niveau */
    (select coalesce(xp,0)::int  from user_levels where user_id = uid) as xp,
    (select coalesce(level,1)::int from user_levels where user_id = uid) as lvl
$function$;

CREATE OR REPLACE FUNCTION public.get_activity_feed(uid uuid, lim integer DEFAULT 20)
RETURNS TABLE(actor_id uuid, actor_name text, actor_avatar text, kind text, payload_id text, payload_title text, posted_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;