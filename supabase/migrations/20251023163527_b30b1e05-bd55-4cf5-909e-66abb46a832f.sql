-- =============================================
-- PATCH 1 : Trigger profiles -> user_levels (garde-fou auth.users)
-- =============================================

CREATE OR REPLACE FUNCTION public.init_user_level_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ne fait rien si l'utilisateur n'existe pas encore dans auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = NEW.id) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.user_levels (user_id, xp, level, last_updated)
  VALUES (NEW.id, 0, 1, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erreur init user_levels pour %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS init_user_level_trigger ON public.profiles;
CREATE TRIGGER init_user_level_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.init_user_level_on_profile();

GRANT EXECUTE ON FUNCTION public.init_user_level_on_profile() TO authenticated, service_role;

COMMENT ON FUNCTION public.init_user_level_on_profile IS
  'Initialise user_levels (xp=0, level=1) pour un profil uniquement si auth.users contient l''utilisateur.';

-- =============================================
-- PATCH 2 : Idempotence du bonus fin de livre via awards table
-- =============================================

CREATE TABLE IF NOT EXISTS public.book_completion_awards (
  user_id uuid NOT NULL,
  book_id text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

ALTER TABLE public.book_completion_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own awards"
  ON public.book_completion_awards
  FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.book_completion_awards IS
  'Enregistre les bonus de fin de livre déjà attribués pour garantir l''idempotence du +200 XP par (user_id, book_id).';

CREATE OR REPLACE FUNCTION public.award_xp_on_book_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bonus_xp INTEGER := 200;
  v_inserted BOOLEAN;
BEGIN
  -- Ne s'applique qu'à la transition vers 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    -- Inscription unique de l'award (idempotence "à vie" par user+book)
    INSERT INTO public.book_completion_awards (user_id, book_id)
    VALUES (NEW.user_id, NEW.book_id)
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS v_inserted = ROW_COUNT; -- 1 si nouvel award, 0 si déjà existant

    IF v_inserted THEN
      PERFORM public.increment_user_xp(NEW.user_id, v_bonus_xp);
      RAISE LOG 'Book completion award: user=%, book=%, +% XP accordé', NEW.user_id, NEW.book_id, v_bonus_xp;
    ELSE
      RAISE LOG 'Book completion award ignoré (déjà attribué): user=%, book=%', NEW.user_id, NEW.book_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Recréer le trigger (remplace l'ancienne version si existante)
DROP TRIGGER IF EXISTS trigger_award_xp_on_completion ON public.reading_progress;
CREATE TRIGGER trigger_award_xp_on_completion
  AFTER UPDATE ON public.reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.award_xp_on_book_completion();

GRANT EXECUTE ON FUNCTION public.award_xp_on_book_completion() TO authenticated, service_role;

COMMENT ON FUNCTION public.award_xp_on_book_completion IS
  'Attribue +200 XP une seule fois par (user_id, book_id) lors du passage à completed (idempotent via book_completion_awards).';

-- =============================================
-- PATCH 3 : Vue matérialisée de monitoring XP
-- =============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.xp_health_check AS
SELECT 
  COUNT(*) FILTER (WHERE au.id IS NULL) AS profiles_orphelins,
  COUNT(*) FILTER (WHERE au.id IS NOT NULL AND ul.user_id IS NULL) AS profils_valides_sans_level,
  AVG(ul.xp)::numeric(10,2) AS xp_moyen,
  AVG(ul.level)::numeric(10,2) AS niveau_moyen,
  NOW() AS last_refreshed
FROM public.profiles p
LEFT JOIN auth.users au ON au.id = p.id
LEFT JOIN public.user_levels ul ON ul.user_id = p.id;

COMMENT ON MATERIALIZED VIEW public.xp_health_check IS
  'Vue de santé XP/Niveaux : profils orphelins, profils sans levels, moyennes. Rafraîchir manuellement via REFRESH MATERIALIZED VIEW.';

-- Rafraîchissement initial
REFRESH MATERIALIZED VIEW public.xp_health_check;

-- =============================================
-- Vérifications post-migration (log only)
-- =============================================

DO $$
DECLARE
  v_trigger_count int;
  v_awards_count bigint;
  v_health_row record;
BEGIN
  -- Vérifier trigger
  SELECT COUNT(*) INTO v_trigger_count
  FROM pg_trigger
  WHERE tgrelid::regclass::text = 'public.reading_progress'
    AND tgname = 'trigger_award_xp_on_completion';
  IF v_trigger_count = 1 THEN
    RAISE NOTICE '✅ Trigger award_xp_on_completion présent';
  ELSE
    RAISE WARNING '⚠️ Trigger award_xp_on_completion manquant';
  END IF;

  -- Vérifier table awards
  SELECT COUNT(*) INTO v_awards_count FROM public.book_completion_awards;
  RAISE NOTICE '✅ Table book_completion_awards créée (% entrées)', v_awards_count;

  -- Afficher santé XP
  SELECT * INTO v_health_row FROM public.xp_health_check;
  RAISE NOTICE '📊 XP Health: orphelins=%, sans_level=%, xp_moyen=%, niveau_moyen=%',
    v_health_row.profiles_orphelins,
    v_health_row.profils_valides_sans_level,
    v_health_row.xp_moyen,
    v_health_row.niveau_moyen;
END $$;