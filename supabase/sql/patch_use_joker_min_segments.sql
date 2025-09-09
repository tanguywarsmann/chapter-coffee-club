-- =====================================================
-- JOKER CONSTRAINT PATCH - PHASE 2 SERVER ENFORCEMENT
-- =====================================================
-- 
-- À appliquer uniquement quand on activera l'enforcement serveur
-- après la phase 1 de déploiement soft (UI uniquement)
--
-- INSTRUCTIONS D'ACTIVATION:
-- 1. Configurer les paramètres DB:
--    ALTER DATABASE postgres SET app.joker_min_segments_enabled = 'true';
--    ALTER DATABASE postgres SET app.joker_min_segments = '3';
--
-- 2. Appliquer cette migration SQL
--
-- ROLLBACK:
--    ALTER DATABASE postgres SET app.joker_min_segments_enabled = 'false';
--    puis revenir à l'ancienne version de use_joker (voir backup ci-dessous)

-- Configuration des paramètres par défaut si non définis
ALTER DATABASE postgres SET app.joker_min_segments_enabled = 'false';  -- désactivé par défaut
ALTER DATABASE postgres SET app.joker_min_segments = '3';

-- Backup de la fonction actuelle (pour rollback)
CREATE OR REPLACE FUNCTION public.use_joker_legacy(p_book_id text, p_user_id uuid, p_segment integer)
 RETURNS TABLE(jokers_remaining integer, success boolean, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_progress_id UUID;
  v_expected_segments INTEGER;
  v_jokers_allowed INTEGER;
  v_jokers_used INTEGER;
  v_jokers_remaining INTEGER;
BEGIN
  -- Récupérer les informations du livre
  SELECT expected_segments INTO v_expected_segments
  FROM books
  WHERE id = p_book_id;
  
  IF v_expected_segments IS NULL THEN
    RETURN QUERY SELECT 0, FALSE, 'Livre introuvable'::TEXT;
    RETURN;
  END IF;
  
  -- Calculer le nombre de jokers autorisés (LOGIQUE LEGACY)
  v_jokers_allowed := FLOOR(v_expected_segments / 10) + 1;
  
  -- ... reste de la logique inchangée ...
  
  -- Récupérer l'ID de progression
  SELECT id INTO v_progress_id
  FROM reading_progress
  WHERE user_id = p_user_id AND book_id = p_book_id;
  
  IF v_progress_id IS NULL THEN
    RETURN QUERY SELECT 0, FALSE, 'Progression de lecture introuvable'::TEXT;
    RETURN;
  END IF;
  
  -- Compter les jokers déjà utilisés
  SELECT COUNT(*) INTO v_jokers_used
  FROM reading_validations
  WHERE progress_id = v_progress_id AND used_joker = TRUE;
  
  -- Calculer les jokers restants
  v_jokers_remaining := v_jokers_allowed - v_jokers_used;
  
  -- Vérifier si des jokers sont disponibles
  IF v_jokers_remaining <= 0 THEN
    RETURN QUERY SELECT 0, FALSE, 'Plus aucun joker disponible pour ce livre'::TEXT;
    RETURN;
  END IF;
  
  -- Vérifier si le segment n'est pas déjà validé
  IF EXISTS (
    SELECT 1 FROM reading_validations 
    WHERE progress_id = v_progress_id AND segment = p_segment
  ) THEN
    RETURN QUERY SELECT v_jokers_remaining, FALSE, 'Segment déjà validé'::TEXT;
    RETURN;
  END IF;
  
  -- Tout est OK, décrémenter les jokers disponibles
  v_jokers_remaining := v_jokers_remaining - 1;
  
  RETURN QUERY SELECT v_jokers_remaining, TRUE, 'Joker utilisé avec succès'::TEXT;
END;
$function$;

-- Nouvelle fonction avec contrainte minimum segments
CREATE OR REPLACE FUNCTION public.use_joker(p_book_id text, p_user_id uuid, p_segment integer)
 RETURNS TABLE(jokers_remaining integer, success boolean, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_progress_id UUID;
  v_expected_segments INTEGER;
  v_jokers_allowed INTEGER;
  v_jokers_used INTEGER;
  v_jokers_remaining INTEGER;
  -- Variables pour la contrainte minimum
  v_constraint_enabled BOOLEAN;
  v_min_segments INTEGER;
BEGIN
  -- Lire la configuration de la contrainte
  BEGIN
    v_constraint_enabled := current_setting('app.joker_min_segments_enabled', true)::boolean;
    v_min_segments := current_setting('app.joker_min_segments', true)::integer;
  EXCEPTION
    WHEN OTHERS THEN
      -- Valeurs par défaut si configuration non trouvée
      v_constraint_enabled := FALSE;
      v_min_segments := 3;
  END;

  -- Récupérer les informations du livre
  SELECT expected_segments INTO v_expected_segments
  FROM books
  WHERE id = p_book_id;
  
  IF v_expected_segments IS NULL THEN
    RETURN QUERY SELECT 0, FALSE, 'Livre introuvable'::TEXT;
    RETURN;
  END IF;
  
  -- NOUVELLE CONTRAINTE: Vérifier le minimum de segments
  IF v_constraint_enabled AND COALESCE(v_expected_segments, 0) < v_min_segments THEN
    RETURN QUERY SELECT 0, FALSE, format('Jokers non disponibles pour les livres de moins de %s segments', v_min_segments)::TEXT;
    RETURN;
  END IF;
  
  -- Calculer le nombre de jokers autorisés avec contrainte
  IF v_constraint_enabled AND COALESCE(v_expected_segments, 0) < v_min_segments THEN
    v_jokers_allowed := 0;
  ELSE
    v_jokers_allowed := FLOOR(v_expected_segments / 10) + 1;
  END IF;
  
  -- Récupérer l'ID de progression
  SELECT id INTO v_progress_id
  FROM reading_progress
  WHERE user_id = p_user_id AND book_id = p_book_id;
  
  IF v_progress_id IS NULL THEN
    RETURN QUERY SELECT 0, FALSE, 'Progression de lecture introuvable'::TEXT;
    RETURN;
  END IF;
  
  -- Compter les jokers déjà utilisés
  SELECT COUNT(*) INTO v_jokers_used
  FROM reading_validations
  WHERE progress_id = v_progress_id AND used_joker = TRUE;
  
  -- Calculer les jokers restants
  v_jokers_remaining := v_jokers_allowed - v_jokers_used;
  
  -- Vérifier si des jokers sont disponibles
  IF v_jokers_remaining <= 0 THEN
    RETURN QUERY SELECT 0, FALSE, 'Plus aucun joker disponible pour ce livre'::TEXT;
    RETURN;
  END IF;
  
  -- Vérifier si le segment n'est pas déjà validé
  IF EXISTS (
    SELECT 1 FROM reading_validations 
    WHERE progress_id = v_progress_id AND segment = p_segment
  ) THEN
    RETURN QUERY SELECT v_jokers_remaining, FALSE, 'Segment déjà validé'::TEXT;
    RETURN;
  END IF;
  
  -- Tout est OK, décrémenter les jokers disponibles
  v_jokers_remaining := v_jokers_remaining - 1;
  
  RETURN QUERY SELECT v_jokers_remaining, TRUE, 'Joker utilisé avec succès'::TEXT;
END;
$function$;

-- Mettre à jour le trigger check_joker_usage pour prendre en compte la contrainte
CREATE OR REPLACE FUNCTION public.check_joker_usage()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_progress_id UUID;
  v_expected_segments INTEGER;
  v_jokers_allowed INTEGER;
  v_jokers_used INTEGER;
  -- Variables pour la contrainte minimum
  v_constraint_enabled BOOLEAN;
  v_min_segments INTEGER;
BEGIN
  -- Lire la configuration de la contrainte
  BEGIN
    v_constraint_enabled := current_setting('app.joker_min_segments_enabled', true)::boolean;
    v_min_segments := current_setting('app.joker_min_segments', true)::integer;
  EXCEPTION
    WHEN OTHERS THEN
      v_constraint_enabled := FALSE;
      v_min_segments := 3;
  END;

  -- Récupérer les informations nécessaires
  SELECT rp.id, b.expected_segments INTO v_progress_id, v_expected_segments
  FROM reading_progress rp
  JOIN books b ON b.id = rp.book_id
  WHERE rp.id = NEW.progress_id;
  
  IF v_expected_segments IS NOT NULL THEN
    -- Appliquer la contrainte minimum si activée
    IF v_constraint_enabled AND COALESCE(v_expected_segments, 0) < v_min_segments THEN
      v_jokers_allowed := 0;
    ELSE
      v_jokers_allowed := FLOOR(v_expected_segments / 10) + 1;
    END IF;
    
    -- Compter les jokers utilisés (incluant le nouveau)
    SELECT COUNT(*) INTO v_jokers_used
    FROM reading_validations
    WHERE progress_id = NEW.progress_id AND used_joker = TRUE;
    
    -- Vérifier si on dépasse la limite
    IF v_jokers_used > v_jokers_allowed THEN
      RAISE EXCEPTION 'Nombre maximum de jokers dépassé pour ce livre (% utilisés sur % autorisés)', 
        v_jokers_used, v_jokers_allowed;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Commande de vérification du statut
-- SELECT current_setting('app.joker_min_segments_enabled', true) as enabled,
--        current_setting('app.joker_min_segments', true) as min_segments;