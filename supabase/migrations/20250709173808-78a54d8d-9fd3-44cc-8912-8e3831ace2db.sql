-- Fonction RPC atomique pour utiliser un joker
CREATE OR REPLACE FUNCTION public.use_joker(
  p_book_id TEXT,
  p_user_id UUID,
  p_segment INTEGER
) RETURNS TABLE (
  jokers_remaining INTEGER,
  success BOOLEAN,
  message TEXT
) AS $$
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
  
  -- Calculer le nombre de jokers autorisés
  v_jokers_allowed := FLOOR(v_expected_segments / 10) + 1;
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Contrainte pour s'assurer que les jokers ne deviennent pas négatifs
-- (cette contrainte est implicite dans la logique RPC, mais bon à avoir)
CREATE OR REPLACE FUNCTION public.check_joker_usage()
RETURNS TRIGGER AS $$
DECLARE
  v_progress_id UUID;
  v_expected_segments INTEGER;
  v_jokers_allowed INTEGER;
  v_jokers_used INTEGER;
BEGIN
  -- Récupérer les informations nécessaires
  SELECT rp.id, b.expected_segments INTO v_progress_id, v_expected_segments
  FROM reading_progress rp
  JOIN books b ON b.id = rp.book_id
  WHERE rp.id = NEW.progress_id;
  
  IF v_expected_segments IS NOT NULL THEN
    -- Calculer le nombre de jokers autorisés
    v_jokers_allowed := FLOOR(v_expected_segments / 10) + 1;
    
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
$$ LANGUAGE plpgsql;

-- Appliquer le trigger uniquement sur les validations avec joker
DROP TRIGGER IF EXISTS check_joker_usage_trigger ON reading_validations;
CREATE TRIGGER check_joker_usage_trigger
  BEFORE INSERT OR UPDATE ON reading_validations
  FOR EACH ROW
  WHEN (NEW.used_joker = TRUE)
  EXECUTE FUNCTION check_joker_usage();

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.use_joker(TEXT, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_joker_usage() TO authenticated;