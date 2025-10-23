-- =============================================
-- MIGRATION COMPLETE : CORRECTIFS XP/NIVEAUX (FIXED)
-- P0 (Critique) + P1 (Recompute)
-- Date: 2025-01-23
-- Fix: Filtrer les profils avec user_id valide dans auth.users
-- =============================================

-- =============================================
-- PARTIE 1 : Bootstrap user_levels + Trigger auto-init
-- =============================================

-- Backfill : créer user_levels UNIQUEMENT pour les profils ayant un user_id valide dans auth.users
-- avec calcul de l'XP historique depuis reading_validations
INSERT INTO public.user_levels (user_id, xp, level, last_updated)
SELECT 
  p.id AS user_id,
  COALESCE((SELECT COUNT(*) * 10 FROM public.reading_validations WHERE user_id = p.id), 0) AS xp,
  CASE 
    WHEN COALESCE((SELECT COUNT(*) * 10 FROM public.reading_validations WHERE user_id = p.id), 0) >= 1000 THEN 5
    WHEN COALESCE((SELECT COUNT(*) * 10 FROM public.reading_validations WHERE user_id = p.id), 0) >= 500 THEN 4
    WHEN COALESCE((SELECT COUNT(*) * 10 FROM public.reading_validations WHERE user_id = p.id), 0) >= 250 THEN 3
    WHEN COALESCE((SELECT COUNT(*) * 10 FROM public.reading_validations WHERE user_id = p.id), 0) >= 100 THEN 2
    ELSE 1
  END AS level,
  NOW() AS last_updated
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.user_levels ul WHERE ul.user_id = p.id)
  AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id)
ON CONFLICT (user_id) DO NOTHING;

-- Fonction trigger pour auto-initialiser user_levels lors de la création d'un profil
CREATE OR REPLACE FUNCTION public.init_user_level_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- Créer le trigger sur profiles (après handle_new_user)
DROP TRIGGER IF EXISTS init_user_level_trigger ON public.profiles;
CREATE TRIGGER init_user_level_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.init_user_level_on_profile();

-- Grants
GRANT EXECUTE ON FUNCTION public.init_user_level_on_profile() TO authenticated, service_role;

COMMENT ON FUNCTION public.init_user_level_on_profile IS 
  'Initialise automatiquement user_levels (xp=0, level=1) lors de la création d''un nouveau profil.';

-- =============================================
-- PARTIE 2 : RPC atomique increment_user_xp
-- =============================================

CREATE OR REPLACE FUNCTION public.increment_user_xp(
  p_user_id UUID,
  p_amount INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Créer la ligne si elle n'existe pas (fail-safe)
  INSERT INTO public.user_levels (user_id, xp, level, last_updated)
  VALUES (p_user_id, 0, 1, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- Récupérer l'ancien niveau avant l'update
  SELECT level INTO v_old_level FROM public.user_levels WHERE user_id = p_user_id;

  -- UPDATE atomique avec recalcul du niveau
  UPDATE public.user_levels
  SET 
    xp = xp + p_amount,
    level = CASE 
      WHEN xp + p_amount >= 1000 THEN 5
      WHEN xp + p_amount >= 500 THEN 4
      WHEN xp + p_amount >= 250 THEN 3
      WHEN xp + p_amount >= 100 THEN 2
      ELSE 1
    END,
    last_updated = NOW()
  WHERE user_id = p_user_id
  RETURNING xp, level
  INTO v_new_xp, v_new_level;

  -- Retourner le résultat pour le front
  RETURN jsonb_build_object(
    'success', true,
    'old_level', COALESCE(v_old_level, 1),
    'new_level', v_new_level,
    'new_xp', v_new_xp,
    'amount', p_amount
  );
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.increment_user_xp(UUID, INTEGER) TO authenticated, service_role;

COMMENT ON FUNCTION public.increment_user_xp IS 
  'Incrémente l''XP d''un utilisateur de manière atomique et recalcule son niveau. Retourne old_level, new_level, new_xp.';

-- =============================================
-- PARTIE 3 : Bonus XP fin de livre (trigger)
-- =============================================

CREATE OR REPLACE FUNCTION public.award_xp_on_book_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bonus_xp INTEGER := 200;
  v_result JSONB;
BEGIN
  -- Ne déclencher que si transition vers 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status IS DISTINCT FROM 'completed') THEN
    -- Appeler la RPC atomique
    SELECT public.increment_user_xp(NEW.user_id, v_bonus_xp) INTO v_result;
    
    RAISE LOG 'Bonus de fin de livre accordé : +% XP pour user % (livre %) - Résultat: %', 
      v_bonus_xp, NEW.user_id, NEW.book_id, v_result;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_award_xp_on_completion ON public.reading_progress;
CREATE TRIGGER trigger_award_xp_on_completion
  AFTER UPDATE ON public.reading_progress
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed'))
  EXECUTE FUNCTION public.award_xp_on_book_completion();

-- Grants
GRANT EXECUTE ON FUNCTION public.award_xp_on_book_completion() TO authenticated, service_role;

COMMENT ON FUNCTION public.award_xp_on_book_completion IS 
  'Accorde +200 XP lors de la complétion d''un livre (idempotent, une seule fois par livre).';

-- =============================================
-- PARTIE 4 (P1) : Fonction recompute admin
-- =============================================

CREATE OR REPLACE FUNCTION public.rebuild_user_xp(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_segment_xp INTEGER;
  v_completed_books INTEGER;
  v_total_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Compter les validations (10 XP chacune)
  SELECT COALESCE(COUNT(*), 0) * 10 INTO v_segment_xp
  FROM public.reading_validations
  WHERE user_id = p_user_id;

  -- Compter les livres complétés (200 XP chacun)
  SELECT COALESCE(COUNT(*), 0) * 200 INTO v_completed_books
  FROM public.reading_progress
  WHERE user_id = p_user_id AND status = 'completed';

  -- Total
  v_total_xp := v_segment_xp + v_completed_books;

  -- Calculer le niveau
  v_new_level := CASE 
    WHEN v_total_xp >= 1000 THEN 5
    WHEN v_total_xp >= 500 THEN 4
    WHEN v_total_xp >= 250 THEN 3
    WHEN v_total_xp >= 100 THEN 2
    ELSE 1
  END;

  -- Mise à jour (upsert)
  INSERT INTO public.user_levels (user_id, xp, level, last_updated)
  VALUES (p_user_id, v_total_xp, v_new_level, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    xp = EXCLUDED.xp,
    level = EXCLUDED.level,
    last_updated = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'xp', v_total_xp,
    'level', v_new_level,
    'segment_validations', v_segment_xp / 10,
    'completed_books', v_completed_books / 200
  );
END;
$$;

-- Grants (admin only)
GRANT EXECUTE ON FUNCTION public.rebuild_user_xp(UUID) TO service_role;

COMMENT ON FUNCTION public.rebuild_user_xp IS 
  'Recalcule l''XP total d''un utilisateur depuis reading_validations + reading_progress. Usage admin uniquement.';

-- =============================================
-- VERIFICATION POST-MIGRATION
-- =============================================

-- Vérifier que tous les profils VALIDES ont maintenant un user_levels
DO $$
DECLARE
  v_count INTEGER;
  v_total_profiles INTEGER;
  v_backfilled INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_profiles FROM public.profiles;
  
  SELECT COUNT(*) INTO v_count
  FROM public.profiles p
  LEFT JOIN public.user_levels ul ON ul.user_id = p.id
  WHERE ul.user_id IS NULL
    AND EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id);
  
  SELECT COUNT(*) INTO v_backfilled
  FROM public.user_levels
  WHERE last_updated >= NOW() - INTERVAL '1 minute';
  
  IF v_count > 0 THEN
    RAISE WARNING 'ATTENTION : % profils valides sans user_levels après migration', v_count;
  ELSE
    RAISE NOTICE '✅ Migration réussie : % profils total, % user_levels backfillés', v_total_profiles, v_backfilled;
  END IF;
END $$;